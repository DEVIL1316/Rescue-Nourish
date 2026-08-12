-- 1. Donations: new structured fields
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS expiry_time timestamptz,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS urgency text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS donor_type text NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- 2. Orphanages: structured needs
ALTER TABLE public.orphanages
  ADD COLUMN IF NOT EXISTS required_food_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_quantity text,
  ADD COLUMN IF NOT EXISTS current_capacity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgency text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- 3. NGOs: structured needs
ALTER TABLE public.ngos
  ADD COLUMN IF NOT EXISTS required_food_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_quantity text,
  ADD COLUMN IF NOT EXISTS current_capacity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgency text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- 4. Deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  assigned_to uuid,
  assigned_name text,
  recipient_name text,
  pickup_location text,
  destination_location text,
  distance_km numeric NOT NULL DEFAULT 0,
  eta_minutes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'assigned',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  picked_up_at timestamptz,
  in_transit_at timestamptz,
  delivered_at timestamptz,
  notes text,
  is_seed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view deliveries"
  ON public.deliveries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Donor NGO or admin can create deliveries"
  ON public.deliveries FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = assigned_to
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.donor_id = auth.uid())
  );

CREATE POLICY "Donor NGO or admin can update deliveries"
  ON public.deliveries FOR UPDATE TO authenticated
  USING (
    auth.uid() = assigned_to
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.donor_id = auth.uid())
  );

CREATE POLICY "Donor NGO or admin can delete deliveries"
  ON public.deliveries FOR DELETE TO authenticated
  USING (
    auth.uid() = assigned_to
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.donor_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS deliveries_donation_id_idx ON public.deliveries(donation_id);
CREATE INDEX IF NOT EXISTS deliveries_status_idx ON public.deliveries(status);

DROP TRIGGER IF EXISTS update_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();