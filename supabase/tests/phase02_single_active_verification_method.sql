-- Phase 02 single active verification adapter assertions.
-- Execute only after the migration is applied to an isolated disposable database.
do $$
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='network_verification_method_catalog' and c.relrowsecurity
  ) then
    raise exception 'verification method catalog must have RLS enabled';
  end if;

  if has_table_privilege('anon','public.network_verification_method_catalog','SELECT')
     or has_table_privilege('authenticated','public.network_verification_method_catalog','SELECT') then
    raise exception 'client roles must not access the server-managed verification catalog';
  end if;

  if has_function_privilege('anon','public.set_network_verification_method(uuid,text,jsonb)','EXECUTE')
     or has_function_privilege('authenticated','public.set_network_verification_method(uuid,text,jsonb)','EXECUTE') then
    raise exception 'client roles must not execute the server-only method selection RPC';
  end if;

  if not has_function_privilege('service_role','public.set_network_verification_method(uuid,text,jsonb)','EXECUTE') then
    raise exception 'service_role must execute the server-only method selection RPC';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname='public'
      and indexname='network_verification_configs_one_enabled_per_network'
      and indexdef ilike '%where (enabled = true)%'
  ) then
    raise exception 'one-enabled-method-per-network unique index is required';
  end if;

  if exists (select 1 from public.network_verification_method_catalog where adapter_ready) then
    raise exception 'no adapter may be marked ready before production verification';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='network_gateway_nonces' and c.relrowsecurity
  ) then
    raise exception 'gateway nonce table must have RLS enabled';
  end if;

  if has_table_privilege('anon','public.network_gateway_nonces','SELECT')
     or has_table_privilege('authenticated','public.network_gateway_nonces','INSERT') then
    raise exception 'client roles must not access gateway nonce storage';
  end if;

  if has_function_privilege('anon','public.consume_network_gateway_nonce(uuid,text,timestamp with time zone)','EXECUTE')
     or has_function_privilege('authenticated','public.consume_network_gateway_nonce(uuid,text,timestamp with time zone)','EXECUTE') then
    raise exception 'client roles must not consume gateway nonces';
  end if;

  if not has_function_privilege('service_role','public.consume_network_gateway_nonce(uuid,text,timestamp with time zone)','EXECUTE') then
    raise exception 'service_role must consume gateway nonces';
  end if;

end;
$$;
