import { createBrowserClient } from "@supabase/ssr";
import { createApiClient } from "@moreai/api-client";

let browserAuth: ReturnType<typeof createBrowserClient> | null = null;

export function getMoreAIApi() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const apiBaseUrl = process.env.NEXT_PUBLIC_MOREAI_API_URL;
  if (!supabaseUrl || !publishableKey || !apiBaseUrl) {
    throw new Error("MoreAI API/Auth environment is not configured.");
  }
  browserAuth ??= createBrowserClient(supabaseUrl, publishableKey);
  return createApiClient({
    baseUrl: apiBaseUrl,
    getAccessToken: async () => {
      const { data, error } = await browserAuth!.auth.getSession();
      if (error) throw new Error("Unable to read the current MoreAI session.");
      return data.session?.access_token ?? null;
    },
  });
}
