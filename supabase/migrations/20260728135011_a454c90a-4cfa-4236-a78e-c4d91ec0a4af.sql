
CREATE OR REPLACE FUNCTION public.mcp_list_ngos(_limit int DEFAULT 50)
RETURNS TABLE(id uuid, name text, description text, location text, website text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, name, description, location, website, created_at
  FROM public.ngos ORDER BY created_at DESC LIMIT LEAST(GREATEST(_limit,1),200);
$$;

CREATE OR REPLACE FUNCTION public.mcp_list_orphanages(_limit int DEFAULT 50)
RETURNS TABLE(id uuid, name text, location text, description text, needs_description text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, name, location, description, needs_description, created_at
  FROM public.orphanages ORDER BY created_at DESC LIMIT LEAST(GREATEST(_limit,1),200);
$$;

CREATE OR REPLACE FUNCTION public.mcp_list_open_needs(_limit int DEFAULT 50)
RETURNS TABLE(id uuid, title text, category text, description text, quantity text, urgency text, status text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, title, category, description, quantity, urgency, status, created_at
  FROM public.needs WHERE status = 'open'
  ORDER BY created_at DESC LIMIT LEAST(GREATEST(_limit,1),200);
$$;

REVOKE ALL ON FUNCTION public.mcp_list_ngos(int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mcp_list_orphanages(int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mcp_list_open_needs(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mcp_list_ngos(int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mcp_list_orphanages(int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mcp_list_open_needs(int) TO anon, authenticated, service_role;
