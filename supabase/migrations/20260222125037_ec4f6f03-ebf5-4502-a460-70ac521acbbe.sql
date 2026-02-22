
-- Create watchlist table for category subscriptions
CREATE TABLE public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for donations
CREATE POLICY "Admins can update any donation" ON public.donations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any donation" ON public.donations FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for notifications
CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for profiles
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for NGOs
CREATE POLICY "Admins can update any NGO" ON public.ngos FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any NGO" ON public.ngos FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for orphanages
CREATE POLICY "Admins can update any orphanage" ON public.orphanages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any orphanage" ON public.orphanages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for needs
CREATE POLICY "Admins can update any need" ON public.needs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any need" ON public.needs FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for watchlist
ALTER PUBLICATION supabase_realtime ADD TABLE public.watchlist;
