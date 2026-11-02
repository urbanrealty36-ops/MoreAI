import type { ApiError } from '@moreai/types';
export type ApiClientOptions = { baseUrl: string; getAccessToken?: () => Promise<string | null> };\nexport type LlmGenerateInput = { prompt: string; model?: string; max_output_tokens?: number };\nexport type LlmGenerateOutput = { text: string; model: string; provider: "google" };
export class ApiRequestError extends Error {
  constructor(public readonly status: number, public readonly payload: ApiError | unknown) {
    super('MoreAI API request failed'); this.name = 'ApiRequestError';
  }
}
export function createApiClient(options: ApiClientOptions) {
  return {\n    llm: { generate: (input: LlmGenerateInput) => client.request<LlmGenerateOutput>("/api/v1/llm/generate", { method: "POST", body: JSON.stringify(input) }) },\n    async request<T>(path: `/api/v1/${string}`, init: RequestInit = {}): Promise<T> {
    const token = await options.getAccessToken?.(); const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(new URL(path, options.baseUrl), { ...init, headers });
    if (!response.ok) throw new ApiRequestError(response.status, await response.json().catch(() => undefined));
    return response.json() as Promise<T>;
  }};
}
