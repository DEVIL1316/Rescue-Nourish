CREATE OR REPLACE FUNCTION public.mcp_list_ngos(_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, name text, description text, location text, website text, created_at timestamp with time zone)
 LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public'
AS $function$
  SELECT id, name, description, location, website, created_at
  FROM public.ngos ORDER BY created_at DESC LIMIT LEAST(GREATEST(_limit,1),200);
$function$;

CREATE OR REPLACE FUNCTION public.mcp_list_orphanages(_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, name text, location text, description text, needs_description text, created_at timestamp with time zone)
 LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public'
AS $function$
  SELECT id, name, location, description, needs_description, created_at
  FROM public.orphanages ORDER BY created_at DESC LIMIT LEAST(GREATEST(_limit,1),200);
$function$;

CREATE OR REPLACE FUNCTION public.mcp_list_open_needs(_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, title text, category text, description text, quantity text, urgency text, status text, created_at timestamp with time zone)
 LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public'
AS $function$
  SELECT id, title, category, description, quantity, urgency, status, created_at
  FROM public.needs WHERE status = 'open'
  ORDER BY created_at DESC LIMIT LEAST(GREATEST(_limit,1),200);
$function$;

REVOKE ALL ON FUNCTION public.mcp_list_ngos(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mcp_list_ngos(integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.mcp_list_orphanages(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mcp_list_orphanages(integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.mcp_list_open_needs(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mcp_list_open_needs(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;