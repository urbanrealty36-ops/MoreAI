-- Hardening patch for lease lifecycle; paired with 20261102082317.
create or replace function public.moreai_worker_claim_run(p_worker_id text,p_lease_seconds integer default 90) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.agent_runs%rowtype; seq bigint; d record;
begin
 if p_worker_id is null or length(p_worker_id)<8 or length(p_worker_id)>128 or p_lease_seconds not between 15 and 900 then raise exception 'invalid worker claim'; end if;
 for d in update public.agent_runs set status='failed',finished_at=now(),dead_lettered_at=now(),lease_owner=null,lease_expires_at=null,updated_at=now() where status='running' and lease_expires_at<now() and attempt>=max_attempts returning id loop
  select coalesce(max(sequence),0)+1 into seq from public.agent_run_events where run_id=d.id;
  insert into public.agent_run_events(run_id,event_type,sequence,payload) values(d.id,'worker.dead_lettered',seq,'{"reason":"lease_expired_max_attempts"}'::jsonb);
 end loop;
 select * into r from public.agent_runs where ((status='queued' and available_at<=now()) or (status='running' and lease_expires_at<now())) and attempt<max_attempts and cancel_requested_at is null order by available_at,created_at for update skip locked limit 1;
 if not found then return null; end if;
 update public.agent_runs set status='running',attempt=attempt+1,lease_owner=p_worker_id,lease_expires_at=now()+make_interval(secs=>p_lease_seconds),heartbeat_at=now(),started_at=coalesce(started_at,now()),updated_at=now() where id=r.id returning * into r;
 select coalesce(max(sequence),0)+1 into seq from public.agent_run_events where run_id=r.id;
 insert into public.agent_run_events(run_id,event_type,sequence,payload) values(r.id,'worker.claimed',seq,jsonb_build_object('worker_id',p_worker_id,'attempt',r.attempt,'lease_seconds',p_lease_seconds));
 return jsonb_build_object('id',r.id,'user_id',r.user_id,'workspace_id',r.workspace_id,'conversation_id',r.conversation_id,'agent_definition_id',r.agent_definition_id,'status',r.status,'attempt',r.attempt,'max_attempts',r.max_attempts,'input',r.input,'lease_owner',r.lease_owner,'lease_expires_at',r.lease_expires_at);
end $$;