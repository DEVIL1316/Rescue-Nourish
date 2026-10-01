CREATE OR REPLACE FUNCTION public.notify_new_donation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  SELECT DISTINCT ur.user_id, 'New food donation',
    COALESCE(NEW.title,'Food') || COALESCE(' · ' || NEW.quantity, '') || COALESCE(' · ' || NEW.location, '') || ' — tap Accept to claim it.',
    'donation', NEW.id
  FROM public.user_roles ur
  WHERE ur.role IN ('ngo','orphanage_member','admin') AND ur.user_id <> NEW.donor_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_new_donation ON public.donations;
CREATE TRIGGER trg_notify_new_donation AFTER INSERT ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.notify_new_donation();

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _name text;
BEGIN
  SELECT NULLIF(full_name,'') INTO _name FROM public.profiles WHERE user_id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (NEW.receiver_id, 'New message from ' || COALESCE(_name,'a user'), LEFT(NEW.content, 140), 'message', NEW.id);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

CREATE OR REPLACE FUNCTION public.notify_donation_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.recipient_id IS NOT NULL AND NEW.recipient_id IS DISTINCT FROM OLD.recipient_id THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (NEW.donor_id, 'Your donation was accepted',
      COALESCE(NEW.recipient_name,'A recipient') || ' accepted "' || NEW.title || '".', 'tracking', NEW.id);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_donation_accepted ON public.donations;
CREATE TRIGGER trg_notify_donation_accepted AFTER UPDATE OF recipient_id ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.notify_donation_accepted();

CREATE OR REPLACE FUNCTION public.accept_donation(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _name text; _n int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF NOT (has_role(_uid,'ngo') OR has_role(_uid,'orphanage_member') OR has_role(_uid,'admin')) THEN
    RAISE EXCEPTION 'Only NGOs, orphanages and admins can accept donations';
  END IF;
  SELECT COALESCE(NULLIF(full_name,''),'Recipient') INTO _name FROM profiles WHERE user_id = _uid;
  UPDATE donations SET recipient_id = _uid, recipient_name = COALESCE(_name,'Recipient'), status = 'claimed'
  WHERE id = _id AND recipient_id IS NULL AND status = 'available';
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n > 0;
END; $$;

REVOKE EXECUTE ON FUNCTION public.notify_new_donation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_donation_accepted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.accept_donation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_donation(uuid) TO authenticated;

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;