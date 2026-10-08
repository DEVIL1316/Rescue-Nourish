CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _name text;
BEGIN
  SELECT NULLIF(full_name, '') INTO _name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (
    NEW.receiver_id,
    'New message from ' || COALESCE(_name, 'a user'),
    LEFT(NEW.content, 140),
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
  _receiver uuid;
  _content text := btrim(COALESCE(_content, ''));
  _channel text := COALESCE(_channel, '');
  _sent integer := 0;
BEGIN
  IF _sender IS NULL THEN
    RAISE EXCEPTION 'Sign in to send a message';
  END IF;
  IF _content = '' OR length(_content) > 1000 THEN
    RAISE EXCEPTION 'Messages must contain 1 to 1000 characters';
  END IF;
  IF _channel NOT IN ('all', 'donor-ngo', 'donor-orphan', 'ngo-orphan') THEN
    RAISE EXCEPTION 'Invalid chat channel';
  END IF;

  FOR _receiver IN
    SELECT DISTINCT user_id
    FROM public.user_roles
    WHERE user_id <> _sender
  LOOP
    INSERT INTO public.messages (sender_id, receiver_id, content)
    VALUES (_sender, _receiver, '[' || _channel || '] ' || _content);
    _sent := _sent + 1;
  END LOOP;

  RETURN _sent;
END;
$function$;

REVOKE ALL ON FUNCTION public.send_chat_message(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_chat_message(text, text) TO authenticated;