/**
 * Smart Matching Algorithm for Rescue & Nourish
 * Scores donor-orphanage compatibility based on:
 * 1. Location proximity (same area = highest score)
 * 2. Food type vs needs keyword matching
 * 3. Orphanage size (larger = higher priority)
 */

import { BANGALORE_LOCATIONS } from '@/components/donation/LocationSelect';

// Location clusters for proximity scoring
const LOCATION_CLUSTERS: Record<string, string[]> = {
  'South': ['Koramangala, Bangalore', 'Jayanagar, Bangalore', 'JP Nagar, Bangalore', 'BTM Layout, Bangalore', 'HSR Layout, Bangalore', 'Banashankari, Bangalore', 'Basavanagudi, Bangalore'],
  'East': ['Indiranagar, Bangalore', 'Whitefield, Bangalore', 'Marathahalli, Bangalore', 'KR Puram, Bangalore'],
  'North': ['Hebbal, Bangalore', 'Yelahanka, Bangalore'],
  'West': ['Rajajinagar, Bangalore', 'Malleswaram, Bangalore', 'Vijayanagar, Bangalore', 'Peenya, Bangalore'],
  'Central': ['MG Road, Bangalore', 'Brigade Road, Bangalore'],
  'South-East': ['Electronic City, Bangalore'],
};

function getCluster(location: string): string | null {
  for (const [cluster, locs] of Object.entries(LOCATION_CLUSTERS)) {
    if (locs.includes(location)) return cluster;
  }
  return null;
}

function locationScore(donorLocation: string, orphanageLocation: string): number {
  if (!donorLocation || !orphanageLocation) return 0;
  if (donorLocation === orphanageLocation) return 100; // Same area
  const c1 = getCluster(donorLocation);
  const c2 = getCluster(orphanageLocation);
  if (c1 && c2 && c1 === c2) return 70; // Same cluster
  // Adjacent clusters get partial score
  const adjacent: Record<string, string[]> = {
    'South': ['East', 'Central', 'South-East'],
    'East': ['South', 'Central', 'North', 'South-East'],
    'North': ['West', 'East', 'Central'],
    'West': ['North', 'Central'],
    'Central': ['South', 'East', 'North', 'West'],
    'South-East': ['South', 'East'],
  };
  if (c1 && c2 && adjacent[c1]?.includes(c2)) return 40;
  return 10; // Far apart
}

function needsScore(foodType: string, needsDescription: string): number {
  if (!foodType || !needsDescription) return 20; // Neutral if no data
  const food = foodType.toLowerCase();
  const needs = needsDescription.toLowerCase();

  const foodKeywords = food.split(/[\s,]+/).filter(w => w.length > 2);
  const needsKeywords = needs.split(/[\s,]+/).filter(w => w.length > 2);

  // Direct food-related need keywords
  const foodNeedWords = ['food', 'rice', 'dal', 'vegetables', 'fruits', 'bread', 'milk', 'dairy', 'cooking', 'nutritious', 'meals', 'snacks', 'beverages', 'oil'];
  const hasGeneralFoodNeed = foodNeedWords.some(w => needs.includes(w));

  // Check for keyword overlap
  let matchCount = 0;
  for (const fk of foodKeywords) {
    if (needsKeywords.some(nk => nk.includes(fk) || fk.includes(nk))) {
      matchCount++;
    }
  }

  if (matchCount > 0) return 100;
  if (hasGeneralFoodNeed) return 60;
  return 15;
}

function sizeScore(numberOfPeople: number | null): number {
  if (!numberOfPeople) return 30;
  if (numberOfPeople >= 100) return 100;
  if (numberOfPeople >= 50) return 70;
  if (numberOfPeople >= 20) return 50;
  return 30;
}

export interface MatchResult {
  orphanage: any;
  score: number;
  locationScore: number;
  needsScore: number;
  sizeScore: number;
  matchLabel: string;
}

export function computeMatches(
  donation: { food_type?: string; title?: string; donor_location?: string },
  orphanages: any[],
  donorProfileLocation?: string
): MatchResult[] {
  const donorLoc = donation.donor_location || donorProfileLocation || '';
  const foodType = donation.food_type || donation.title || '';

  return orphanages
    .map(orphanage => {
      const ls = locationScore(donorLoc, orphanage.location || '');
      const ns = needsScore(foodType, orphanage.needs_description || '');
      const ss = sizeScore(orphanage.number_of_people);

      // Weighted score: location 40%, needs 40%, size 20%
      const score = Math.round(ls * 0.4 + ns * 0.4 + ss * 0.2);

      let matchLabel = 'Low Match';
      if (score >= 75) matchLabel = 'Excellent Match';
      else if (score >= 55) matchLabel = 'Good Match';
      else if (score >= 35) matchLabel = 'Fair Match';

      return { orphanage, score, locationScore: ls, needsScore: ns, sizeScore: ss, matchLabel };
    })
    .sort((a, b) => b.score - a.score);
}
