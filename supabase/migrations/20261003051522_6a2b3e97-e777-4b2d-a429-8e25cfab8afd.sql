CREATE OR REPLACE FUNCTION public.notify_new_donation()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  SELECT DISTINCT ON (ur.user_id) ur.user_id, 'New food donation',
    'Dear ' || CASE ur.role WHEN 'orphanage_member' THEN 'orphanage' WHEN 'ngo' THEN 'NGO' ELSE 'admin' END ||
    ', someone donated ' || COALESCE(NEW.title,'food') || COALESCE(' (' || NEW.quantity || ')', '') || COALESCE(' at ' || NEW.location, '') ||
    '. Do you want to accept or ignore it?',
    'donation', NEW.id
  FROM public.user_roles ur
  WHERE ur.role IN ('ngo','orphanage_member','admin') AND ur.user_id <> NEW.donor_id;
  RETURN NEW;
END; $function$;