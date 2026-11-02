import { createBrowserClient } from "@supabase/ssr";
import { createApiClient } from "@moreai/api-client";
let authClient: ReturnType<typeof createBrowserClient> | null = null;
export function getPortalApi() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const baseUrl=process.env.NEXT_PUBLIC_MOREAI_API_URL;
  if(!url||!key||!baseUrl)throw new Error("MoreAI Auth/API environment is not configured.");
  authClient??=createBrowserClient(url,key);
  return createApiClient({baseUrl,getAccessToken:async()=>{
    const {data,error}=await authClient!.auth.getSession();
    if(error)throw new Error("Unable to read authentication session.");
    return data.session?.access_token??null;
  }});
}
