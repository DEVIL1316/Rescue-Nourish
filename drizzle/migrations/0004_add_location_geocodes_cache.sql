CREATE TABLE public.location_geocodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL UNIQUE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.location_geocodes TO authenticated;
GRANT ALL ON public.location_geocodes TO service_role;

ALTER TABLE public.location_geocodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY location_geocodes_read_authenticated
  ON public.location_geocodes
  FOR SELECT
  TO authenticated
  USING (true);