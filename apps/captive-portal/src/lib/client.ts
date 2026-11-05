import { createApiClient } from "@moreai/api-client";

export function getCaptivePortalApi() {
  const baseUrl = process.env.NEXT_PUBLIC_MOREAI_API_URL;
  if (!baseUrl) throw new Error("MoreAI API endpoint is not configured.");
  return createApiClient({ baseUrl });
}
