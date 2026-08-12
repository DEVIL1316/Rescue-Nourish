# Structured Donation, Recipient and Delivery Data

Turn the free-text fields in the app into structured data, then fill the app with realistic seed records so matching, analytics and anomaly detection have something to work on.

## 1. Donations — new fields

| Field | Type | Notes |
|---|---|---|
| Expiry time | timestamp | Powers "expires in 3h" badges and urgency auto-escalation |
| Location | text | Picked from the existing 20 Bangalore neighbourhoods |
| Urgency | low / medium / high | Auto-set from expiry, donor can override |
| Donor type | individual / restaurant / caterer / event / grocery | Used for analytics and anomaly baselines |

Donation history already exists (created_at plus pickup/delivery timestamps) — it just needs a proper "My past donations" view with totals.

The donation form gains an expiry picker, location dropdown, urgency selector and donor-type selector. Donation cards show an expiry countdown and colour-coded urgency chip. Expired items are filtered out of the browse list automatically.

## 2. Orphanages and NGOs — structured needs

Today needs are one free-text sentence. Replace with:

| Field | Type | Notes |
|---|---|---|
| Required food types | multi-select list | Cooked meals, rice/grains, vegetables, fruits, dairy, bakery, packaged, beverages |
| Required quantity | text | e.g. "50 meals/day" |
| Current capacity | number | How many people they can serve right now |
| Urgency | low / medium / high | Surfaces critical recipients first |

Existing free-text `needs_description` stays as an extra notes field so nothing is lost. Previous accepted donations come from a per-recipient history list built on delivered donations.

## 3. Deliveries — new table

A dedicated delivery record created when a donation is accepted:

| Field | Notes |
|---|---|
| Pickup location | Copied from the donation |
| Destination | The recipient's location |
| Distance (km) | Estimated from location clusters |
| Estimated delivery time | Distance plus a fixed handling buffer |
| Status | assigned → picked up → in transit → delivered → cancelled |
| Assigned NGO, timestamps | Who is carrying it and when each step happened |

The existing tracking columns on donations stay in sync so nothing currently on screen breaks.

### Cluster-based distance

Reuse the six clusters already defined in the matching code (South, East, North, West, Central, South-East):

```text
same neighbourhood   ~3 km    ~20 min
same cluster         ~7 km    ~30 min
adjacent cluster    ~15 km    ~50 min
far cluster         ~25 km    ~75 min
```

Travel time assumes 20 km/h Bangalore traffic plus a 10 minute handling buffer. Values are clearly labelled "estimated" in the UI.

## 4. Smarter matching

With structured fields, the matching score gets more accurate while keeping the current weights:

- Location proximity 40% — now uses the km estimate rather than a cluster tier alone
- Need match 40% — exact food-type overlap instead of keyword guessing, falls back to keywords when a recipient has not filled the structured fields
- Capacity fit 20% — compares donation quantity against remaining capacity instead of just headcount

Urgency acts as a tie-breaker so near-expiry food and critical recipients rise to the top.

## 5. Seed data

Roughly 40 synthetic records spread across Bangalore:

- 12 orphanages and 8 NGOs with realistic capacities, food-type needs and urgency mix
- 20 donations across all donor types, mixed expiry windows (some already expired, some urgent)
- 12 deliveries in various stages so tracking and analytics render populated
- Timestamps spread over the past 30 days so charts and anomaly rules have history

All seed rows are tagged so they can be removed in one action when real data arrives.

## Technical notes

- Migrations add the new columns with safe defaults so existing rows stay valid; the deliveries table gets grants and row-level policies matching the current donation rules (recipients and assigned NGOs read, admin full access).
- Distance helpers live alongside the existing cluster map in the matching library — no external mapping service, no API key.
- Food type becomes a shared constant list used by both the donation form and the recipient needs form, so both sides speak the same vocabulary.
- Recipient profile forms gain the structured fields while keeping the free-text notes field.

## Order of work

1. Migration: donation fields plus recipient needs fields
2. Migration: deliveries table with policies
3. Shared food-type constants and distance helpers
4. Forms and cards updated for the new fields
5. Matching algorithm upgrade
6. Delivery view with distance and ETA
7. Seed data load
