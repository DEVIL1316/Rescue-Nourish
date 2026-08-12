/**
 * Smart Matching Algorithm for Rescue & Nourish
 * Scores donor-recipient compatibility based on:
 * 1. Location proximity  (40%) — cluster-based km estimate
 * 2. Need match          (40%) — structured food-type overlap, keyword fallback
 * 3. Capacity fit        (20%) — donation size vs remaining capacity
 * Urgency is used as a tie-breaker.
 */

import { proximityScore, estimateRoute } from '@/lib/distance';
import { parseQuantity } from '@/lib/donationConstants';

function keywordNeedsScore(foodType: string, needsDescription: string): number {
  if (!foodType || !needsDescription) return 20;
  const food = foodType.toLowerCase();
  const needs = needsDescription.toLowerCase();

  const foodKeywords = food.split(/[\s,]+/).filter(w => w.length > 2);
  const needsKeywords = needs.split(/[\s,]+/).filter(w => w.length > 2);

  const foodNeedWords = ['food', 'rice', 'dal', 'vegetables', 'fruits', 'bread', 'milk', 'dairy', 'cooking', 'nutritious', 'meals', 'snacks', 'beverages', 'oil'];
  const hasGeneralFoodNeed = foodNeedWords.some(w => needs.includes(w));

  let matchCount = 0;
  for (const fk of foodKeywords) {
    if (needsKeywords.some(nk => nk.includes(fk) || fk.includes(nk))) matchCount++;
  }

  if (matchCount > 0) return 100;
  if (hasGeneralFoodNeed) return 60;
  return 15;
}

/** Structured food-type overlap when the recipient filled in required_food_types. */
function needsScore(foodType: string, recipient: any): number {
  const required: string[] = Array.isArray(recipient?.required_food_types) ? recipient.required_food_types : [];
  if (required.length > 0 && foodType) {
    const food = foodType.toLowerCase();
    const exact = required.some(r => r.toLowerCase() === food);
    if (exact) return 100;
    const partial = required.some(r => {
      const rl = r.toLowerCase();
      return rl.includes(food) || food.includes(rl) || rl.split(/[\s&/]+/).some(w => w.length > 3 && food.includes(w));
    });
    if (partial) return 80;
    return 25;
  }
  return keywordNeedsScore(foodType, recipient?.needs_description || '');
}

/**
 * Capacity fit: how well the donation size suits the remaining capacity.
 * Falls back to headcount when capacity is not recorded.
 */
function capacityScore(donationQuantity: string | undefined, recipient: any): number {
  const capacity = Number(recipient?.current_capacity) || 0;
  const headcount = Number(recipient?.number_of_people) || 0;
  const qty = parseQuantity(donationQuantity);

  if (capacity > 0 && qty) {
    const ratio = qty / capacity;
    if (ratio >= 0.75 && ratio <= 1.5) return 100; // right-sized
    if (ratio >= 0.4 && ratio < 0.75) return 75;
    if (ratio > 1.5 && ratio <= 3) return 60;
    return 35;
  }

  const size = capacity || headcount;
  if (!size) return 30;
  if (size >= 100) return 100;
  if (size >= 50) return 70;
  if (size >= 20) return 50;
  return 30;
}

function urgencyBonus(urgency?: string | null): number {
  if (urgency === 'high') return 2;
  if (urgency === 'low') return -1;
  return 0;
}

export interface MatchResult {
  orphanage: any;
  score: number;
  locationScore: number;
  needsScore: number;
  sizeScore: number;
  matchLabel: string;
  distanceKm: number;
  etaMinutes: number;
  distanceLabel: string;
}

export function computeMatches(
  donation: { food_type?: string; title?: string; donor_location?: string; quantity?: string; urgency?: string },
  recipients: any[],
  donorProfileLocation?: string
): MatchResult[] {
  const donorLoc = donation.donor_location || donorProfileLocation || '';
  const foodType = donation.food_type || donation.title || '';

  return recipients
    .map(recipient => {
      const ls = proximityScore(donorLoc, recipient.location || '');
      const ns = needsScore(foodType, recipient);
      const ss = capacityScore(donation.quantity, recipient);
      const route = estimateRoute(donorLoc, recipient.location || '');

      let score = Math.round(ls * 0.4 + ns * 0.4 + ss * 0.2);
      // Urgency on either side nudges the ranking without overwhelming the weights.
      score = Math.max(0, Math.min(100, score + urgencyBonus(recipient.urgency) + urgencyBonus(donation.urgency)));

      let matchLabel = 'Low Match';
      if (score >= 75) matchLabel = 'Excellent Match';
      else if (score >= 55) matchLabel = 'Good Match';
      else if (score >= 35) matchLabel = 'Fair Match';

      return {
        orphanage: recipient,
        score,
        locationScore: ls,
        needsScore: ns,
        sizeScore: ss,
        matchLabel,
        distanceKm: route.distanceKm,
        etaMinutes: route.etaMinutes,
        distanceLabel: route.label,
      };
    })
    .sort((a, b) => b.score - a.score);
}
