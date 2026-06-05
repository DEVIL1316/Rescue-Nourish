
DROP POLICY IF EXISTS "Anyone can view donations" ON public.donations;
CREATE POLICY "Authenticated can view donations" ON public.donations FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.donations FROM anon;

DROP POLICY IF EXISTS "Authenticated can create orphanages" ON public.orphanages;
CREATE POLICY "Orphanage members can create orphanages" ON public.orphanages FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by AND (public.has_role(auth.uid(), 'orphanage_member'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));
