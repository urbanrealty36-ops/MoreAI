begin;

do $$
declare
  rls_enabled boolean;
begin
  if to_regclass('public.llm_request_records') is null then
    raise exception 'FAIL: durable LLM request ledger table is missing';
  end if;

  select relrowsecurity
    into rls_enabled
    from pg_class
   where oid = 'public.llm_request_records'::regclass;

  if not coalesce(rls_enabled, false) then
    raise exception 'FAIL: LLM request records must have RLS enabled';
  end if;

  if has_table_privilege('authenticated', 'public.llm_request_records', 'SELECT') then
    raise exception 'FAIL: authenticated clients must not read internal LLM request records';
  end if;

  if not has_table_privilege('service_role', 'public.llm_request_records', 'SELECT') then
    raise exception 'FAIL: service role must be able to reconcile LLM requests';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.moreai_llm_claim_request(uuid,uuid,text,text)',
    'EXECUTE'
  ) then
    raise exception 'FAIL: authenticated clients must not claim internal LLM requests';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.moreai_llm_finalize_request(uuid,numeric,text,text)',
    'EXECUTE'
  ) then
    raise exception 'FAIL: service role must be able to finalize LLM settlement';
  end if;

  if not exists (
    select 1
      from pg_indexes
     where schemaname = 'public'
       and tablename = 'agent_runs'
       and indexname = 'agent_runs_user_id_idempotency_key_key'
  ) then
    raise exception 'FAIL: agent run idempotency must be uniquely indexed per user';
  end if;

  if not exists (
    select 1
      from pg_trigger
     where tgrelid = 'public.credit_ledger'::regclass
       and not tgisinternal
  ) then
    raise exception 'FAIL: credit ledger must have an immutability trigger';
  end if;
end;
$$;

rollback;
