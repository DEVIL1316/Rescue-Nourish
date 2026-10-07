DROP POLICY IF EXISTS "Authenticated can view NGOs" ON public.ngos;
CREATE POLICY "Authenticated can view NGOs" ON public.ngos
  FOR SELECT TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);

DROP POLICY IF EXISTS "Authenticated can view needs" ON public.needs;
CREATE POLICY "Authenticated can view needs" ON public.needs
  FOR SELECT TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);

DROP POLICY IF EXISTS "Authenticated can view donations" ON public.donations;
CREATE POLICY "Authenticated can view donations" ON public.donations
  FOR SELECT TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);

DROP POLICY IF EXISTS "Authenticated can view orphanages" ON public.orphanages;
CREATE POLICY "Authenticated can view orphanages" ON public.orphanages
  FOR SELECT TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);

CREATE POLICY "Block anonymous sessions from deliveries" ON public.deliveries
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from donation bookings" ON public.donation_bookings
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from donations" ON public.donations
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from messages" ON public.messages
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from needs" ON public.needs
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from NGOs" ON public.ngos
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from notifications" ON public.notifications
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from orphanages" ON public.orphanages
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from profiles" ON public.profiles
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from user roles" ON public.user_roles
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);
CREATE POLICY "Block anonymous sessions from watchlist" ON public.watchlist
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE)
  WITH CHECK (COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE);