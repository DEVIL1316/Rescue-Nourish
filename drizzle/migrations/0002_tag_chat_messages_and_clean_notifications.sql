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

REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;

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
  _intent text := split_part(COALESCE(_channel, ''), '|', 2);
  _tagged_message text;
  _sent integer := 0;
BEGIN
  IF _sender IS NULL THEN
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

  FOR _receiver IN
    SELECT DISTINCT user_id
    FROM public.user_roles
    WHERE user_id <> _sender
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