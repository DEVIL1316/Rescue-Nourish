CREATE OR REPLACE FUNCTION public.notify_new_message()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _name text;
BEGIN
  SELECT NULLIF(full_name,'') INTO _name FROM public.profiles WHERE user_id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  SELECT DISTINCT ur.user_id, 'New message from ' || COALESCE(_name,'a user'), LEFT(NEW.content, 140), 'message', NEW.id
  FROM public.user_roles ur WHERE ur.user_id <> NEW.sender_id;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.notify_donation_accepted()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _donor text;
BEGIN
  IF NEW.recipient_id IS NOT NULL AND NEW.recipient_id IS DISTINCT FROM OLD.recipient_id THEN
    SELECT COALESCE(NULLIF(full_name,''),'a donor') INTO _donor FROM public.profiles WHERE user_id = NEW.donor_id;
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (NEW.donor_id, 'Your donation was accepted',
      'Dear donor, ' || COALESCE(NEW.recipient_name,'a recipient') || ' accepted your donation "' || NEW.title || '".', 'tracking', NEW.id);
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    SELECT DISTINCT ur.user_id, 'Donation accepted',
      COALESCE(NEW.recipient_name,'A recipient') || ' accepted the donation "' || NEW.title || '" from ' || COALESCE(_donor,'a donor') || '.',
      'info', NEW.id
    FROM public.user_roles ur
    WHERE ur.role IN ('ngo','admin') AND ur.user_id <> NEW.recipient_id AND ur.user_id <> NEW.donor_id;
  END IF;
  RETURN NEW;
END; $function$;