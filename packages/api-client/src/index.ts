import type { ApiError } from "@moreai/types";

export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
};

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: ApiError | unknown,
  ) {
    super("MoreAI API request failed");
    this.name = "ApiRequestError";
  }
}

type AgentRun = {
  id: string;
  status: string;
  attempt: number;
  max_attempts: number;
  error?: unknown;
};

const phaseNotActive = <T,>(): Promise<T> =>
  Promise.reject(
    new ApiRequestError(501, {
      code: "PHASE_NOT_ACTIVE",
      message: "This API capability is not activated in the current source-migration phase.",
    }),
  );

export function createApiClient(options: ApiClientOptions) {
  return {
    llm: {
      generate: async (
        _input: { prompt: string; model?: string; max_output_tokens?: number },
        _idempotencyKey: string,
      ): Promise<{ text: string }> => phaseNotActive(),
    },
    agents: {
      list: async (): Promise<{ items: AgentRun[] }> => phaseNotActive(),
      get: async (_id: string): Promise<{ run: AgentRun }> => phaseNotActive(),
      create: async (
        _input: { prompt: string; agent_key: string },
        _idempotencyKey: string,
      ): Promise<{ run: AgentRun }> => phaseNotActive(),
      cancel: async (_id: string): Promise<void> => phaseNotActive(),
    },
    async request<T>(
      path: `/api/v1/${string}`,
      init: RequestInit = {},
    ): Promise<T> {
      const token = await options.getAccessToken?.();
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const response = await fetch(new URL(path, options.baseUrl), {
        ...init,
        headers,
      });
      if (!response.ok) {
        throw new ApiRequestError(
          response.status,
          await response.json().catch(() => undefined),
        );
      }
      return response.json() as Promise<T>;
    },
  };
}
