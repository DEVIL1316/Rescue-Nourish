ALTER TABLE public.messages
  ADD COLUMN message_scope text NOT NULL DEFAULT 'community',
  ADD COLUMN attachment jsonb;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_scope_check
  CHECK (message_scope IN ('community', 'private'));

CREATE INDEX messages_private_thread_created_idx
  ON public.messages (message_scope, sender_id, receiver_id, created_at);

DROP POLICY IF EXISTS "Authenticated can send messages" ON public.messages;
DROP POLICY IF EXISTS "Sender can update own messages" ON public.messages;
REVOKE INSERT, UPDATE ON public.messages FROM authenticated;

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _name text;
  _message text;
BEGIN
  IF NEW.receiver_id = NEW.sender_id OR NEW.message_scope = 'private' THEN
    RETURN NEW;
  END IF;

  SELECT NULLIF(full_name, '') INTO _name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  _message := regexp_replace(NEW.content, '^\[[^]]+\]\s*', '');

  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (
    NEW.receiver_id,
    'New message from ' || COALESCE(_name, 'a user'),
    LEFT(_message, 140),
    'message',
    NEW.id
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_chat_message(_content text, _channel text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _sender uuid := auth.uid();
  _sender_role public.app_role;
  _receiver uuid;
  _message text := btrim(COALESCE(_content, ''));
  _channel_id text := split_part(COALESCE(_channel, ''), '|', 1);
  _intent text := split_part(COALESCE(_channel, ''), '|', 3);
  _tagged_message text;
  _sent integer := 0;
BEGIN
  IF _sender IS NULL OR COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'Sign in to send a message';
  END IF;
  IF _message = '' OR length(_message) > 1000 THEN
    RAISE EXCEPTION 'Messages must contain 1 to 1000 characters';
  END IF;
  IF _channel_id NOT IN ('all', 'donor-ngo', 'donor-orphan', 'ngo-orphan') THEN
    RAISE EXCEPTION 'Invalid chat channel';
  END IF;
  IF _intent NOT IN ('request', 'donate', 'help') THEN
    RAISE EXCEPTION 'Invalid message type';
  END IF;

  SELECT role INTO _sender_role
  FROM public.user_roles
  WHERE user_id = _sender
  ORDER BY id
  LIMIT 1;

  IF _sender_role IS NULL THEN
    RAISE EXCEPTION 'Your account does not have a role';
  END IF;
  IF _sender_role <> 'admin' AND (
    (_channel_id = 'donor-ngo' AND _sender_role NOT IN ('donor', 'ngo')) OR
    (_channel_id = 'donor-orphan' AND _sender_role NOT IN ('donor', 'orphanage_member')) OR
    (_channel_id = 'ngo-orphan' AND _sender_role NOT IN ('ngo', 'orphanage_member'))
  ) THEN
    RAISE EXCEPTION 'Your role cannot send to this chat';
  END IF;

  _tagged_message := '[' || _channel_id || '|' || _sender_role::text || '|' || _intent || '] ' || _message;

  INSERT INTO public.messages (sender_id, receiver_id, content)
  VALUES (_sender, _sender, _tagged_message);

  FOR _receiver IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    WHERE ur.user_id <> _sender
      AND (
        _channel_id = 'all'
        OR ur.role = 'admin'
        OR (_channel_id = 'donor-ngo' AND ur.role IN ('donor', 'ngo'))
        OR (_channel_id = 'donor-orphan' AND ur.role IN ('donor', 'orphanage_member'))
        OR (_channel_id = 'ngo-orphan' AND ur.role IN ('ngo', 'orphanage_member'))
      )
  LOOP
    INSERT INTO public.messages (sender_id, receiver_id, content)
    VALUES (_sender, _receiver, _tagged_message);
    _sent := _sent + 1;
  END LOOP;

  RETURN _sent;
END;
$function$;

REVOKE ALL ON FUNCTION public.send_chat_message(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_chat_message(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.send_private_message(
  _receiver uuid,
  _content text,
  _attachment jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _sender uuid := auth.uid();
  _body text := btrim(COALESCE(_content, ''));
  _safe_attachment jsonb;
  _latitude double precision;
  _longitude double precision;
  _label text;
  _donation_id uuid;
  _donation record;
  _message_id uuid;
BEGIN
  IF _sender IS NULL OR COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'Sign in to send a private message';
  END IF;
  IF _receiver IS NULL OR _receiver = _sender OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _receiver
  ) THEN
    RAISE EXCEPTION 'Choose another active community member';
  END IF;
  IF length(_body) > 1000 THEN
    RAISE EXCEPTION 'Messages must be 1000 characters or fewer';
  END IF;
  IF _attachment IS NOT NULL THEN
    IF jsonb_typeof(_attachment) <> 'object' THEN
      RAISE EXCEPTION 'Invalid attachment';
    END IF;
    IF _attachment ->> 'kind' = 'location' THEN
      IF jsonb_typeof(_attachment -> 'latitude') <> 'number'
        OR jsonb_typeof(_attachment -> 'longitude') <> 'number' THEN
        RAISE EXCEPTION 'Location coordinates are required';
      END IF;
      _latitude := (_attachment ->> 'latitude')::double precision;
      _longitude := (_attachment ->> 'longitude')::double precision;
      IF _latitude NOT BETWEEN -90 AND 90 OR _longitude NOT BETWEEN -180 AND 180 THEN
        RAISE EXCEPTION 'Location coordinates are out of range';
      END IF;
      _label := left(btrim(COALESCE(_attachment ->> 'label', 'Shared location')), 100);
      _safe_attachment := jsonb_build_object(
        'kind', 'location', 'latitude', _latitude, 'longitude', _longitude, 'label', _label
      );
      IF _body = '' THEN _body := _label; END IF;
    ELSIF _attachment ->> 'kind' = 'donation' THEN
      BEGIN
        _donation_id := (_attachment ->> 'donation_id')::uuid;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Choose a valid donation';
      END;
      SELECT id, title, food_type, quantity, location, status, urgency, donor_id, recipient_id
      INTO _donation
      FROM public.donations
      WHERE id = _donation_id
        AND is_seed = false
        AND (donor_id = _sender OR recipient_id = _sender);
      IF NOT FOUND THEN
        RAISE EXCEPTION 'You can only share a donation you own or received';
      END IF;
      _safe_attachment := jsonb_build_object(
        'kind', 'donation',
        'donation_id', _donation.id,
        'title', _donation.title,
        'food_type', _donation.food_type,
        'quantity', _donation.quantity,
        'location', _donation.location,
        'status', _donation.status,
        'urgency', _donation.urgency
      );
      IF _body = '' THEN _body := 'Shared a food donation'; END IF;
    ELSE
      RAISE EXCEPTION 'Unsupported attachment type';
    END IF;
  ELSIF _body = '' THEN
    RAISE EXCEPTION 'Write a message or choose an attachment';
  END IF;

  INSERT INTO public.messages (sender_id, receiver_id, content, message_scope, attachment)
  VALUES (_sender, _receiver, _body, 'private', _safe_attachment)
  RETURNING id INTO _message_id;

  RETURN _message_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.send_private_message(uuid, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_private_message(uuid, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_private_messages_read(_partner uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _reader uuid := auth.uid();
  _updated integer;
BEGIN
  IF _reader IS NULL OR COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'Sign in to update messages';
  END IF;
  IF _partner IS NULL OR _partner = _reader THEN
    RETURN 0;
  END IF;

  UPDATE public.messages
  SET is_read = true
  WHERE message_scope = 'private'
    AND sender_id = _partner
    AND receiver_id = _reader
    AND is_read = false;
  GET DIAGNOSTICS _updated = ROW_COUNT;
  RETURN _updated;
END;
$function$;

REVOKE ALL ON FUNCTION public.mark_private_messages_read(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_private_messages_read(uuid) TO authenticated;