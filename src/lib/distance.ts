/**
 * Cluster-based distance and travel-time estimation for Bangalore.
 * No mapping service, no API key — the 20 supported neighbourhoods are
 * grouped into six clusters and distance is estimated from cluster relations.
 * All values shown in the UI must be labelled "estimated".
 */

export const LOCATION_CLUSTERS: Record<string, string[]> = {
  South: [
    'Koramangala, Bangalore',
    'Jayanagar, Bangalore',
    'JP Nagar, Bangalore',
    'BTM Layout, Bangalore',
    'HSR Layout, Bangalore',
    'Banashankari, Bangalore',
    'Basavanagudi, Bangalore',
  ],
  East: ['Indiranagar, Bangalore', 'Whitefield, Bangalore', 'Marathahalli, Bangalore', 'KR Puram, Bangalore'],
  North: ['Hebbal, Bangalore', 'Yelahanka, Bangalore'],
  West: ['Rajajinagar, Bangalore', 'Malleswaram, Bangalore', 'Vijayanagar, Bangalore', 'Peenya, Bangalore'],
  Central: ['MG Road, Bangalore', 'Brigade Road, Bangalore'],
  'South-East': ['Electronic City, Bangalore'],
};

export const ADJACENT_CLUSTERS: Record<string, string[]> = {
  South: ['East', 'Central', 'South-East'],
  East: ['South', 'Central', 'North', 'South-East'],
  North: ['West', 'East', 'Central'],
  West: ['North', 'Central'],
  Central: ['South', 'East', 'North', 'West'],
  'South-East': ['South', 'East'],
};

export function getCluster(location?: string | null): string | null {
  if (!location) return null;
  for (const [cluster, locs] of Object.entries(LOCATION_CLUSTERS)) {
    if (locs.includes(location)) return cluster;
  }
  return null;
}

export type Proximity = 'same-area' | 'same-cluster' | 'adjacent-cluster' | 'far' | 'unknown';

export function getProximity(from?: string | null, to?: string | null): Proximity {
  if (!from || !to) return 'unknown';
  if (from === to) return 'same-area';
  const a = getCluster(from);
  const b = getCluster(to);
  if (!a || !b) return 'unknown';
  if (a === b) return 'same-cluster';
  if (ADJACENT_CLUSTERS[a]?.includes(b)) return 'adjacent-cluster';
  return 'far';
}

const DISTANCE_BY_PROXIMITY: Record<Proximity, number> = {
  'same-area': 3,
  'same-cluster': 7,
  'adjacent-cluster': 15,
  far: 25,
  unknown: 15,
};

/** Average Bangalore traffic speed used for the estimate. */
const AVERAGE_SPEED_KMH = 20;
/** Fixed buffer for loading, handover and paperwork. */
const HANDLING_BUFFER_MIN = 10;

export interface RouteEstimate {
  proximity: Proximity;
  distanceKm: number;
  etaMinutes: number;
  label: string;
}

export function estimateRoute(from?: string | null, to?: string | null): RouteEstimate {
  const proximity = getProximity(from, to);
  const distanceKm = DISTANCE_BY_PROXIMITY[proximity];
  const etaMinutes = Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60 + HANDLING_BUFFER_MIN);
  const labels: Record<Proximity, string> = {
    'same-area': 'Same neighbourhood',
    'same-cluster': 'Same zone',
    'adjacent-cluster': 'Nearby zone',
    far: 'Across the city',
    unknown: 'Distance unknown',
  };
  return { proximity, distanceKm, etaMinutes, label: labels[proximity] };
}

/** 0-100 proximity score used by the matching engine. */
export function proximityScore(from?: string | null, to?: string | null): number {
  switch (getProximity(from, to)) {
    case 'same-area':
      return 100;
    case 'same-cluster':
      return 70;
    case 'adjacent-cluster':
      return 40;
    case 'far':
      return 10;
    default:
      return 0;
  }
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
