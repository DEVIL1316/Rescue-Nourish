
-- 1. NGOs: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view NGOs" ON public.ngos;
CREATE POLICY "Authenticated can view NGOs"
ON public.ngos
FOR SELECT
TO authenticated
USING (true);
REVOKE SELECT ON public.ngos FROM anon;

-- 2. Orphanages: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view orphanages" ON public.orphanages;
CREATE POLICY "Authenticated can view orphanages"
ON public.orphanages
FOR SELECT
TO authenticated
USING (true);
REVOKE SELECT ON public.orphanages FROM anon;

-- 3. Profiles: restrict to owner or admin
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Owners and admins can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Revoke EXECUTE on SECURITY DEFINER helpers from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
