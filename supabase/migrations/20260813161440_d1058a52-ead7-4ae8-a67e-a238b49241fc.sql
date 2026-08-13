-- 1. Restrict delivery visibility
DROP POLICY IF EXISTS "Authenticated can view deliveries" ON public.deliveries;
CREATE POLICY "Involved parties can view deliveries"
ON public.deliveries FOR SELECT TO authenticated
USING (
  auth.uid() = assigned_to
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.donations d
    WHERE d.id = deliveries.donation_id
      AND (d.donor_id = auth.uid() OR d.recipient_id = auth.uid())
  )
);

-- 2. Restrict booking visibility
DROP POLICY IF EXISTS "Authenticated can view bookings" ON public.donation_bookings;
CREATE POLICY "Involved parties can view bookings"
ON public.donation_bookings FOR SELECT TO authenticated
USING (
  auth.uid() = booked_by
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.donations d
    WHERE d.id = donation_bookings.donation_id
      AND d.donor_id = auth.uid()
  )
);

-- 3. Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.mcp_list_ngos(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mcp_list_ngos(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.mcp_list_orphanages(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mcp_list_orphanages(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.mcp_list_open_needs(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mcp_list_open_needs(integer) TO authenticated, service_role;