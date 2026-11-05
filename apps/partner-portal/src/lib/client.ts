import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createApiClient } from "@moreai/api-client";

let authClient: SupabaseClient | null = null;

export function getPortalAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("MoreAI Auth environment is not configured.");
  authClient ??= createBrowserClient(url, key);
  return authClient;
}

export function getPortalApi() {
  const baseUrl = process.env.NEXT_PUBLIC_MOREAI_API_URL;
  if (!baseUrl) throw new Error("MoreAI API environment is not configured.");
  const auth = getPortalAuth();
  return createApiClient({
    baseUrl,
    getAccessToken: async () => {
      const { data, error } = await auth.auth.getSession();
      if (error) throw new Error("Unable to read authentication session.");
      return data.session?.access_token ?? null;
    },
  });
}
