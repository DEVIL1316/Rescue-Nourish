// Google Maps helper service for the app.
// All Google API calls run server-side through the connector gateway;
// the browser key is used only for map rendering (src/lib/googleMaps.ts).

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_maps';
// Locations are Bangalore neighbourhoods; suffix keeps geocoding unambiguous.
const LOCATION_SUFFIX = 'Karnataka, India';

interface Creds {
  LOVABLE_API_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function gatewayHeaders(c: Creds) {
  return {
    Authorization: `Bearer ${c.LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': c.GOOGLE_MAPS_API_KEY,
  };
}

async function geocodeOne(address: string, c: Creds): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=in`,
    { headers: gatewayHeaders(c) },
  );
  const text = await res.text();
  if (!res.ok) {
    console.error(`Geocode failed [${res.status}]: ${text}`);
    throw new Error(`Geocode upstream error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = JSON.parse(text);
  const loc = data?.results?.[0]?.geometry?.location;
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
    console.error(`Geocode returned no results: ${text.slice(0, 200)}`);
    return null;
  }
  return { lat: loc.lat, lng: loc.lng };
}

async function geocodeLocations(locations: string[], admin: SupabaseClient, c: Creds) {
  const { data: cached } = await admin
    .from('location_geocodes')
    .select('location, latitude, longitude')
    .in('location', locations);
  const cacheMap = new Map((cached ?? []).map((row: any) => [row.location, row]));

  const results: Array<{ location: string; latitude: number; longitude: number }> = [];
  const errors: string[] = [];
  const misses: string[] = [];
  for (const loc of locations) {
    const row = cacheMap.get(loc);
    if (row) results.push({ location: loc, latitude: row.latitude, longitude: row.longitude });
    else misses.push(loc);
  }

  for (const loc of misses) {
    try {
      const coords = await geocodeOne(`${loc}, ${LOCATION_SUFFIX}`, c);
      if (!coords) continue;
      results.push({ location: loc, latitude: coords.lat, longitude: coords.lng });
      await admin.from('location_geocodes').upsert(
        { location: loc, latitude: coords.lat, longitude: coords.lng },
        { onConflict: 'location' },
      );
    } catch (e) {
      errors.push(`${loc}: ${e?.message ?? 'geocode failed'}`);
    }
  }
  return { results, errors };
}

async function computeRoute(pickup: string, destination: string, c: Creds) {
  const res = await fetch(`${GATEWAY_URL}/routes/directions/v2:computeRoutes`, {
    method: 'POST',
    headers: {
      ...gatewayHeaders(c),
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
    },
    body: JSON.stringify({
      origin: { address: `${pickup}, Bangalore, ${LOCATION_SUFFIX}` },
      destination: { address: `${destination}, Bangalore, ${LOCATION_SUFFIX}` },
      travelMode: 'DRIVE',
    }),
  });

  if (res.status === 403) {
    const details: Array<{ reason?: string }> = (await res.json().catch(() => ({})))?.error?.details ?? [];
    const reason = details.find((d) => d.reason)?.reason;
    if (reason === 'API_KEY_HTTP_REFERRER_BLOCKED') {
      throw new Error('Maps server key is referrer-restricted. In Google Cloud Console, set the server key\'s application restrictions to "None" or "IP addresses".');
    }
    if (reason === 'API_KEY_SERVICE_BLOCKED') {
      throw new Error('Maps server key does not allow the Routes API. In Google Cloud Console, add the Routes API to the key\'s allowed-APIs list.');
    }
    throw new Error('Google Maps route request was denied (403). Check the server key\'s restrictions in Google Cloud Console.');
  }

  if (!res.ok) {
    const text = await res.text();
    console.error(`Route failed [${res.status}]: ${text}`);
    throw new Error('Route lookup failed');
  }

  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route || typeof route.distanceMeters !== 'number' || !route.duration) return null;

  const durationSeconds = parseFloat(route.duration);
  return {
    distanceKm: Math.round(route.distanceMeters / 100) / 10,
    durationMinutes: Number.isFinite(durationSeconds) ? Math.round(durationSeconds / 60) : null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return json({ error: 'Maps integration is not configured' }, 500);
    }
    const creds: Creds = { LOVABLE_API_KEY, GOOGLE_MAPS_API_KEY };

    // Only signed-in app users may trigger Google Maps lookups.
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Sign in to use map features' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === 'geocode') {
      const locations: string[] = (Array.isArray(body.locations) ? body.locations : [])
        .filter((l: unknown) => typeof l === 'string' && l.trim().length > 0 && l.length <= 120)
        .slice(0, 25);
      if (locations.length === 0) return json({ results: [] });
      const { results, errors } = await geocodeLocations([...new Set(locations)], admin, creds);
      return json({ results, errors });
    }

    if (action === 'route') {
      const pickup = typeof body.pickup === 'string' ? body.pickup.slice(0, 120) : '';
      const destination = typeof body.destination === 'string' ? body.destination.slice(0, 120) : '';
      if (!pickup || !destination) return json({ error: 'pickup and destination are required' }, 400);
      const route = await computeRoute(pickup, destination, creds);
      return json(route ?? { unavailable: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('maps-service failed:', e);
    return json({ error: e?.message ?? 'Maps request failed' }, 500);
  }
});
