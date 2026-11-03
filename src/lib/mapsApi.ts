import { supabase } from '@/integrations/supabase/client';

export interface GeocodeResult {
  location: string;
  latitude: number;
  longitude: number;
}

export interface GoogleRoute {
  distanceKm: number;
  durationMinutes: number | null;
}

/**
 * Backend-backed Google Maps lookups (maps-service edge function).
 * Results are cached server-side so repeat lookups cost nothing extra.
 */
export async function geocodeLocations(locations: string[]): Promise<GeocodeResult[]> {
  const { data, error } = await supabase.functions.invoke('maps-service', {
    body: { action: 'geocode', locations },
  });
  if (error) throw error;
  return (data?.results ?? []) as GeocodeResult[];
}

/** Real driving distance and duration, or null when Google finds no route. */
export async function fetchGoogleRoute(pickup: string, destination: string): Promise<GoogleRoute | null> {
  const { data, error } = await supabase.functions.invoke('maps-service', {
    body: { action: 'route', pickup, destination },
  });
  if (error) throw error;
  if (data && typeof data.distanceKm === 'number') return data as GoogleRoute;
  return null;
}
