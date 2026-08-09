CREATE TABLE public.donation_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id uuid NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  booked_by uuid NOT NULL,
  booker_name text,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (donation_id, slot_date, slot_time)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.donation_bookings TO authenticated;
GRANT ALL ON public.donation_bookings TO service_role;

ALTER TABLE public.donation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bookings"
ON public.donation_bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own bookings"
ON public.donation_bookings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = booked_by);

CREATE POLICY "Booker donor or admin can update bookings"
ON public.donation_bookings FOR UPDATE TO authenticated
USING (
  auth.uid() = booked_by
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.donor_id = auth.uid())
);

CREATE POLICY "Booker donor or admin can delete bookings"
ON public.donation_bookings FOR DELETE TO authenticated
USING (
  auth.uid() = booked_by
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.donor_id = auth.uid())
);

CREATE TRIGGER update_donation_bookings_updated_at
BEFORE UPDATE ON public.donation_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_donation_bookings_donation ON public.donation_bookings(donation_id);