# Runbook — MikroTik Hotspot gateway adapter

## Status and safety

The adapter is implemented but is not production-ready until a real RouterOS device and production credentials pass the Super Admin validation endpoint. Do not set `adapter_ready` or enable a network configuration manually. The portal must fail closed while the catalog is not ready, the network method is not selected, its network config is disabled, or credentials cannot be resolved.

## Server-side secret bundle

Inject `NETWORK_GATEWAY_SECRETS_JSON` into the FastAPI runtime from the approved server secret manager. Never commit this value, expose it to a client, or paste credentials into chat or tickets.

The variable is a JSON object keyed by an opaque secret reference. Example shape only; values below are placeholders:

```json
{
  "vault://moreai/network/example-network/mikrotik": {
    "router_url": "https://router.example.invalid",
    "username": "moreai-readonly-api",
    "password": "INJECT_FROM_SECRET_MANAGER",
    "hmac_secret": "INJECT_RANDOM_SECRET_AT_LEAST_32_BYTES"
  }
}
```

The RouterOS API user should be a dedicated least-privilege account with read-only access to system resource and hotspot active session records. RouterOS REST must use HTTPS with a certificate trusted by the API runtime. Do not disable TLS verification or allow HTTP redirects. Network firewall/VPN policy must limit RouterOS management access to the MoreAI API runtime egress.

## Partner and Super Admin sequence

1. Partner selects exactly `mikrotik_hotspot` for one network and supplies its Gateway ID. This selection does not activate access.
2. Super Admin stores only the opaque secret reference through `PUT /api/v1/admin/networks/{network_id}/mikrotik-secret-reference`. The endpoint resolves the reference server-side; it never receives the password or HMAC key from the browser.
3. Super Admin runs `POST /api/v1/admin/networks/{network_id}/mikrotik-credentials/validate`. The API calls `GET /rest/system/resource` over verified HTTPS. Only a successful RouterOS response plus a valid secret bundle marks the adapter ready and enables that network's method config.
4. Verify signed context delivery from the configured gateway and a real active Hotspot session. Do not claim end-to-end success based only on the credential check.

## Signed context contract

Gateway sends `POST /api/v1/network/gateway/mikrotik/context/verify` with JSON fields:

- `network_id`, `gateway_id`, `session_id`
- `client_mac`, `client_ip`, `username`, `hotspot_server`
- `timestamp` (Unix seconds), `nonce` (cryptographically random, 22–128 URL-safe characters)
- `signature` (hex HMAC-SHA256; optional `sha256=` prefix)

Signature is calculated over all fields except `signature`, serialized as UTF-8 JSON with sorted keys, compact separators `(',', ':')`, and ASCII escaping enabled. HMAC key is the `hmac_secret` value in the referenced server-side secret bundle. The maximum clock skew defaults to 120 seconds.

The API checks network selection and gateway binding, verifies HMAC with constant-time comparison, verifies RouterOS active session by exact `.id`, MAC, IP, username and hotspot server, then consumes SHA-256(nonce) through the service-role-only database RPC. The unique key `(network_id, nonce_hash)` makes concurrent/replayed requests fail closed. The nonce is never stored in plaintext.

A successful response proves the gateway session only. It does not grant Partner Free or any reward. Entitlement issuance must remain a separate authenticated policy decision.

## Operational acceptance evidence

Record RouterOS model/RouterOS version, TLS certificate validation, read-only API account permission, secret-reference ID (not its value), gateway ID/network binding, successful credential validation audit event, valid signed session proof, expired timestamp rejection, invalid signature rejection, replay rejection (including concurrent replay), and network mismatch rejection.

Do not place client MAC/IP or subscriber identity into general logs. Retain only the minimum audit/evidence required by policy.
