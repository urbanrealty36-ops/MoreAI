-- Single active verification adapter per partner network.
-- Additive and fail-closed: existing networks remain unconfigured; no adapter is enabled.
create table if not exists public.network_verification_method_catalog (
  method_key text primary key check (method_key in ('gps','mikrotik_hotspot','radius','gateway','isp_api')),
  display_name text not null,
  adapter_key text not null unique,
  enabled boolean not null default false,
  adapter_ready boolean not null default false,
  requires_secret boolean not null default false,
  setup_requirements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.network_verification_method_catalog
  (method_key, display_name, adapter_key, enabled, adapter_ready, requires_secret, setup_requirements)
values
  ('gps','GPS / Geolocation','gps',false,false,false,'{"permission":"location","requirements":["browser_geolocation","server_side_radius_validation"]}'),
  ('mikrotik_hotspot','MikroTik Hotspot','mikrotik_hotspot',false,false,true,'{"requirements":["routeros_api_or_signed_callback","gateway_secret_reference","nonce_replay_protection"]}'),
  ('radius','RADIUS','radius',false,false,true,'{"requirements":["radius_server","shared_secret_reference","accounting_or_auth_evidence"]}'),
  ('gateway','Other Gateway / Controller','gateway',false,false,true,'{"requirements":["supported_gateway_adapter","signed_session_context"]}'),
  ('isp_api','ISP API','isp_api',false,false,true,'{"requirements":["provider_contract","provider_credentials_reference","signed_callback_or_api_auth"]}')
on conflict (method_key) do nothing;

alter table public.partner_networks
  add column if not exists active_verification_method text;

alter table public.partner_networks
  add constraint partner_networks_active_verification_method_check
  check (active_verification_method is null or active_verification_method in ('gps','mikrotik_hotspot','radius','gateway','isp_api'));

create unique index if not exists network_verification_configs_one_enabled_per_network
  on public.network_verification_configs(network_id) where enabled = true;

alter table public.network_verification_method_catalog enable row level security;
revoke all on public.network_verification_method_catalog from anon, authenticated;
grant select, insert, update on public.network_verification_method_catalog to service_role;
grant select, insert, update on public.partner_networks to service_role;
grant select, insert, update on public.network_verification_configs to service_role;

create index if not exists partner_networks_active_verification_method_idx
  on public.partner_networks(active_verification_method);

comment on table public.network_verification_method_catalog is
  'Platform-managed adapter catalog. Methods remain disabled until adapter readiness and production configuration are verified.';
comment on column public.partner_networks.active_verification_method is
  'The sole selected verification adapter for this network. NULL means not configured; selection does not imply activation.';
