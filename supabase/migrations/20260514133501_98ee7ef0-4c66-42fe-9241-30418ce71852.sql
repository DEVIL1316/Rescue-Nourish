ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_donor_id_fkey;
ALTER TABLE public.needs DROP CONSTRAINT IF EXISTS needs_posted_by_fkey;
ALTER TABLE public.ngos DROP CONSTRAINT IF EXISTS ngos_user_id_fkey;
ALTER TABLE public.donations ADD CONSTRAINT donations_donor_id_fkey FOREIGN KEY (donor_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.needs ADD CONSTRAINT needs_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.ngos ADD CONSTRAINT ngos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;