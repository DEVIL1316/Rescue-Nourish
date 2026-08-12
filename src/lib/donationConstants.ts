/**
 * Shared vocabulary for donations and recipient needs.
 * Both the donation form and the orphanage/NGO needs form use these lists
 * so the matching engine can compare structured values instead of guessing.
 */

export const FOOD_TYPES = [
  'Cooked Meals',
  'Rice & Grains',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Bakery',
  'Packaged Food',
  'Beverages',
] as const;

export type FoodType = (typeof FOOD_TYPES)[number];

export const DONOR_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'event', label: 'Event / Function' },
  { value: 'grocery', label: 'Grocery / Retail' },
] as const;

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export function urgencyClasses(urgency?: string | null) {
  switch (urgency) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'low':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200';
  }
}

/** Hours left before the food expires. Negative means already expired. */
export function hoursUntilExpiry(expiry?: string | null): number | null {
  if (!expiry) return null;
  return (new Date(expiry).getTime() - Date.now()) / 3_600_000;
}

export function isExpired(expiry?: string | null): boolean {
  const h = hoursUntilExpiry(expiry);
  return h !== null && h <= 0;
}

/** Human friendly countdown, e.g. "expires in 3h", "expires in 2d", "expired". */
export function formatExpiry(expiry?: string | null): string | null {
  const h = hoursUntilExpiry(expiry);
  if (h === null) return null;
  if (h <= 0) return 'Expired';
  if (h < 1) return `Expires in ${Math.round(h * 60)} min`;
  if (h < 48) return `Expires in ${Math.round(h)}h`;
  return `Expires in ${Math.round(h / 24)}d`;
}

/** Food close to expiry is automatically more urgent. Donors can still override. */
export function urgencyFromExpiry(expiry?: string | null): string {
  const h = hoursUntilExpiry(expiry);
  if (h === null) return 'medium';
  if (h <= 6) return 'high';
  if (h <= 24) return 'medium';
  return 'low';
}

/** Pull a rough numeric quantity out of free text like "50 kg" or "30 meals". */
export function parseQuantity(quantity?: string | null): number | null {
  if (!quantity) return null;
  const match = quantity.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}
