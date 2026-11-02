-- Keep the SECURITY DEFINER event-trigger function internal to database DDL execution.
-- It must never be callable through exposed PostgREST RPC.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
