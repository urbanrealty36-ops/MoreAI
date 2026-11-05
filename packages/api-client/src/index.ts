import type { ApiError } from "@moreai/types";

export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
};
export type LlmGenerateInput = { prompt: string; model?: string; max_output_tokens?: number };
export type LlmGenerateOutput = {
  text: string; model: string; provider: string; request_id: string;
  usage: { input_tokens: number; output_tokens: number };
};
export type AgentRun = {
  id: string; status: "queued" | "running" | "waiting_approval" | "succeeded" | "failed" | "cancelled" | "expired";
  attempt: number; max_attempts: number; created_at: string;
  started_at?: string | null; finished_at?: string | null; output?: unknown; error?: unknown;
};
export type CreateAgentRunInput = {
  prompt: string; workspace_id?: string; conversation_id?: string; agent_key?: string; max_attempts?: number;
};
export type PartnerSummary = { partner: { id: string; legal_name?: string; display_name?: string; status: string }; membership: unknown };
export type Collection<T> = { items: T[] };
export type Conversation = { id: string; workspace_id?: string | null; title?: string | null; status: "active" | "archived" | "deleted"; created_at: string; updated_at: string };
export type ConversationMessage = { id: string; role: "system" | "user" | "assistant" | "tool"; content: string; model_key?: string | null; run_id?: string | null; token_input: number; token_output: number; metadata?: Record<string, unknown>; created_at: string };
export type WorkspaceWallet = { available: boolean; wallet: null | { id: string; currency: string; balance: number; status: string; updated_at: string }; transactions: Array<{ id: string; entry_type: string; amount: number; balance_after: number; description?: string | null; created_at: string }> };
export type VerificationMethodKey = "gps" | "mikrotik_hotspot" | "radius" | "gateway" | "isp_api";
export type GatewayContextInput = { network_id:string; gateway_id:string; session_id:string; client_mac:string; client_ip:string; username:string; hotspot_server:string; timestamp:number; nonce:string; signature:string };
export type GatewayContextVerificationResult = {
  verified: true;
  method: "mikrotik_hotspot";
  network_id: string;
  partner_id: string;
  location_id: string | null;
  gateway_session_id: string;
  client_mac: string;
  verified_at: number;
  partner_entitlement_activated: false;
  message: string;
};
export type AccessVerificationInput = {
  network_id: string;
  access_code?: string | null;
  gateway_session_id?: string | null;
};
export type VerificationMethod = { method_key: VerificationMethodKey; display_name: string; adapter_key: string; enabled: boolean; adapter_ready: boolean; requires_secret: boolean; setup_requirements: Record<string,unknown> };

export class ApiRequestError extends Error {
  constructor(public readonly status: number, public readonly payload: ApiError | unknown) {
    super("MoreAI API request failed"); this.name = "ApiRequestError";
  }
}
export function createApiClient(options: ApiClientOptions) {
  async function request<T>(path: `/api/v1/${string}`, init: RequestInit = {}, idempotencyKey?: string): Promise<T> {
    const token = await options.getAccessToken?.();
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
    const response = await fetch(new URL(path, options.baseUrl), { ...init, headers });
    if (!response.ok) throw new ApiRequestError(response.status, await response.json().catch(() => undefined));
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
  const get = <T>(path: `/api/v1/${string}`) => request<T>(path);
  const post = <T>(path: `/api/v1/${string}`, body?: unknown, key?: string) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }, key);
  const patch = <T>(path: `/api/v1/${string}`, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  return {
    request, get, post,
    llm: { generate: (input: LlmGenerateInput, key: string) => post<LlmGenerateOutput>("/api/v1/llm/generate", input, key) },
    agents: {
      list: () => get<Collection<AgentRun>>("/api/v1/agents/runs"),
      get: (id: string) => get<{ run: AgentRun }>(`/api/v1/agents/runs/${id}`),
      events: (id: string) => get<Collection<{id:string;event_type:string;sequence:number;created_at:string;payload:Record<string,unknown>}>>(`/api/v1/agents/runs/${id}/events`),
      steps: (id: string) => get<Collection<{id:string;sequence:number;step_key:string;status:string;started_at?:string|null;finished_at?:string|null;created_at:string}>>(`/api/v1/agents/runs/${id}/steps`),
      create: (input: CreateAgentRunInput, key: string) => post<{ run: AgentRun; replayed: boolean }>("/api/v1/agents/runs", input, key),
      cancel: (id: string) => post<{ run_id: string; status: string }>(`/api/v1/agents/runs/${id}/cancel`),
      resume: (id: string) => post<{ run_id: string; status: string }>(`/api/v1/agents/runs/${id}/resume`),
    },
    workspace: {
      conversations: () => get<Collection<Conversation>>("/api/v1/workspace/conversations"),
      createConversation: (input: {title?: string; workspace_id?: string}) => post<{conversation: Conversation}>("/api/v1/workspace/conversations", input),
      updateConversation: (id: string, input: {title?: string; status?: "active" | "archived"}) => patch<{conversation: Conversation}>(`/api/v1/workspace/conversations/${id}`, input),
      messages: (id: string) => get<Collection<ConversationMessage>>(`/api/v1/workspace/conversations/${id}/messages`),
      sendMessage: (id: string, input: {content: string; model?: string; max_output_tokens?: number}, key: string) => post<{user_message: ConversationMessage; assistant_message: ConversationMessage; replayed: boolean}>(`/api/v1/workspace/conversations/${id}/messages`, input, key),
      files: () => get<Collection<Record<string, unknown>>>("/api/v1/workspace/files"),
      fileDownload: (id:string) => get<{url:string;expires_in:number;file_name:string}>(`/api/v1/workspace/files/${id}/download`),
      wallet: () => get<WorkspaceWallet>("/api/v1/workspace/wallet"),
      entitlements: () => get<Collection<Record<string, unknown>>>("/api/v1/workspace/entitlements"),
      memory: () => get<Record<string, unknown>>("/api/v1/workspace/memory"),
      subscription: () => get<Record<string, unknown>>("/api/v1/workspace/subscription"),
    },
    partner: {
      me: () => get<PartnerSummary>("/api/v1/partner/me"),
      onboardingStatus: () => get<{status:string;partner:Record<string,unknown>|null;membership:Record<string,unknown>|null}>("/api/v1/partner/onboarding"),
      submitApplication: (input:{legal_name:string;display_name:string}) => post<{application:{partner:Record<string,unknown>;membership:Record<string,unknown>;replayed:boolean}}>("/api/v1/partner/onboarding",input),
      branches: () => get<Collection<unknown>>("/api/v1/partner/branches"),
      networks: () => get<Collection<unknown>>("/api/v1/partner/networks"),
      campaigns: () => get<Collection<unknown>>("/api/v1/partner/campaigns"),
      rewards: () => get<Collection<unknown>>("/api/v1/partner/rewards"),
      analytics: () => get<Record<string, number | string>>("/api/v1/partner/analytics"),
      verificationMethods: (networkId?: string) => get<{items: unknown[]; methods: VerificationMethod[]; selected_by_network: Record<string,string|null>}>(`/api/v1/partner/verification-methods${networkId ? `?network_id=${networkId}` : ""}`),
      selectVerificationMethod: (networkId: string, methodKey: VerificationMethodKey, configPublic: Record<string,unknown> = {}) => post<Record<string,unknown>>(`/api/v1/partner/networks/${networkId}/verification-method`, {method_key:methodKey,config_public:configPublic}),
      createBranch: (input: {name:string;address?:Record<string,unknown>;latitude?:number|null;longitude?:number|null;timezone?:string}) => post<{item:Record<string,unknown>}>("/api/v1/partner/branches", input),
      updateBranch: (id:string,input:Record<string,unknown>) => patch<{item:Record<string,unknown>}>(`/api/v1/partner/branches/${id}`,input),
      createNetwork: (input: {location_id:string;name:string;ssid_label?:string|null;gateway_type:string;provider_id?:string|null;gateway_network_ref?:string|null}) => post<{item:Record<string,unknown>}>("/api/v1/partner/networks",input),
      updateNetwork: (id:string,input:Record<string,unknown>) => patch<{item:Record<string,unknown>}>(`/api/v1/partner/networks/${id}`,input),
      createCampaign: (input: {name:string;location_id?:string|null;starts_at?:string|null;ends_at?:string|null;budget?:number|null;config?:Record<string,unknown>}) => post<{item:Record<string,unknown>}>("/api/v1/partner/campaigns",input),
      updateCampaign: (id:string,input:Record<string,unknown>) => patch<{item:Record<string,unknown>}>(`/api/v1/partner/campaigns/${id}`,input),
      createReward: (input: {campaign_id:string;reward_type:"credit"|"discount"|"access"|"voucher"|"benefit";name:string;quantity_limit?:number|null;reward_value?:number|null;config?:Record<string,unknown>}) => post<{item:Record<string,unknown>}>("/api/v1/partner/rewards",input),
      updateReward: (id:string,input:Record<string,unknown>) => patch<{item:Record<string,unknown>}>(`/api/v1/partner/rewards/${id}`,input),
    },
    admin: {
      overview: () => get<Record<string, number>>("/api/v1/admin/overview"),
      users: () => get<Collection<unknown>>("/api/v1/admin/users"),
      providers: () => get<Collection<{id:string;key:string;display_name:string;enabled:boolean;credentials_configured:boolean}>>("/api/v1/admin/providers"),
      createProvider: (input:{key:"google"|"openai"|"anthropic";display_name:string;enabled?:boolean}) => post<{provider:Record<string,unknown>}>("/api/v1/admin/providers",input),
      updateProvider: (id:string,input:{display_name:string;enabled:boolean}) => patch<{provider:Record<string,unknown>}>(`/api/v1/admin/providers/${id}`,input),
      disableProvider: (id:string) => request<{provider:Record<string,unknown>}>(`/api/v1/admin/providers/${id}`,{method:"DELETE"}),
      createModel: (input:{provider_id:string;key:string;display_name:string;input_cost_per_million:number;output_cost_per_million:number;max_input_tokens?:number|null;max_output_tokens?:number|null;capabilities:string[];enabled?:boolean}) => post<{model:Record<string,unknown>}>("/api/v1/admin/models",input),
      updateModel: (id:string,input:{provider_id:string;key:string;display_name:string;input_cost_per_million:number;output_cost_per_million:number;max_input_tokens?:number|null;max_output_tokens?:number|null;capabilities:string[];enabled:boolean}) => request<{model:Record<string,unknown>}>(`/api/v1/admin/models/${id}`,{method:"PUT",body:JSON.stringify(input)}),
      disableModel: (id:string) => request<{model:Record<string,unknown>}>(`/api/v1/admin/models/${id}`,{method:"DELETE"}),
      createRouting: (input:{task_type:"general";model_id:string;fallback_model_id?:string|null;priority:number;enabled?:boolean}) => post<{policy:Record<string,unknown>}>("/api/v1/admin/llm-routing",input),
      updateRouting: (id:string,input:{task_type:"general";model_id:string;fallback_model_id?:string|null;priority:number;enabled:boolean}) => request<{policy:Record<string,unknown>}>(`/api/v1/admin/llm-routing/${id}`,{method:"PUT",body:JSON.stringify(input)}),
      disableRouting: (id:string) => request<{policy:Record<string,unknown>}>(`/api/v1/admin/llm-routing/${id}`,{method:"DELETE"}),
      models: () => get<Collection<unknown>>("/api/v1/admin/models"),
      audit: () => get<Collection<unknown>>("/api/v1/admin/audit"),
      setRolePermission: (roleKey:string,permissionKey:string,enabled:boolean) => request<{role_key:string;permission_key:string;enabled:boolean}>(`/api/v1/admin/roles/${roleKey}/permissions/${permissionKey}`,{method:"PUT",body:JSON.stringify({enabled})}),
      roleAssignments: () => get<Collection<{id:string;user_id:string;role_id:string;assigned_by:string;expires_at?:string|null;created_at:string;role?:{key:string;description?:string}}>>("/api/v1/admin/role-assignments"),
      assignRole: (input:{target_user_id:string;role_key:"super_admin"|"platform_admin"|"finance_admin"|"partner_manager"|"security_admin"|"support_admin"|"read_only_analyst";expires_at?:string|null}) => post<Record<string,unknown>>("/api/v1/admin/role-assignments",input),
      revokeRole: (id:string,input:{reason?:string}) => request<{assignment_id:string;revoked:boolean}>(`/api/v1/admin/role-assignments/${id}`,{method:"DELETE",body:JSON.stringify(input)}),
      partners: (status?: "pending" | "active" | "suspended" | "rejected" | "closed") => get<Collection<Record<string, unknown>>>(`/api/v1/admin/partners${status ? `?status_filter=${status}` : ""}`),
      reviewPartner: (id:string,input:{decision:"approve"|"reject"|"suspend";reason?:string}) => post<{partner:Record<string,unknown>;replayed:boolean}>(`/api/v1/admin/partners/${id}/review`,input),
      permissionMatrix: () => get<{roles: Array<{id:string;key:string;scope:string;description?:string;system_role:boolean;permissions:string[]}>;permissions:Array<{id:string;key:string;description?:string}>}>("/api/v1/admin/permission-matrix"),
      llmRouting: () => get<Collection<Record<string, unknown>>>("/api/v1/admin/llm-routing"),
      verificationMethods: () => get<Collection<VerificationMethod>>("/api/v1/admin/network-verification-methods"),
      setVerificationMethodAvailability: (methodKey: VerificationMethodKey, enabled: boolean) => patch<Record<string,unknown>>(`/api/v1/admin/network-verification-methods/${methodKey}`, {enabled}),
      networkPolicies: () => get<Collection<any>>("/api/v1/admin/network-policies"),
      setMikrotikSecretReference: (networkId: string, secretReference: string) => request<Record<string,unknown>>(`/api/v1/admin/networks/${networkId}/mikrotik-secret-reference`, {method:"PUT",body:JSON.stringify({secret_reference:secretReference})}),
      validateMikrotikCredentials: (networkId: string) => post<Record<string,unknown>>(`/api/v1/admin/networks/${networkId}/mikrotik-credentials/validate`),
    },
    network: {
      context: () => get<Record<string, unknown>>("/api/v1/network/portal-context"),
      verify: (input: AccessVerificationInput, key: string) => post<Record<string, unknown>>("/api/v1/network/access/verify", input, key),
      verifyGatewayContext: (input: GatewayContextInput) => post<GatewayContextVerificationResult>("/api/v1/network/gateway/mikrotik/context/verify", input),
      session: () => get<Record<string, unknown>>("/api/v1/network/access/session"),
      refreshSession: () => post<Record<string, unknown>>("/api/v1/network/access/session/refresh"),
      endSession: () => post<Record<string, unknown>>("/api/v1/network/access/session/end"),
    },
  };
}
