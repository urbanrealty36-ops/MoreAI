import { createApiClient } from "@moreai/api-client";

export function getMoreAIApi() {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_MOREAI_API_URL ?? "",
  });
}
