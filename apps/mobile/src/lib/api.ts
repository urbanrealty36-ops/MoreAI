import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { createApiClient } from "@moreai/api-client";
const secureStorage = {
 getItem:(key:string)=>SecureStore.getItemAsync(key),
 setItem:(key:string,value:string)=>SecureStore.setItemAsync(key,value),
 removeItem:(key:string)=>SecureStore.deleteItemAsync(key),
};
let authClient:ReturnType<typeof createClient>|null=null;
export function getMobileAuth(){
 const url=process.env.EXPO_PUBLIC_SUPABASE_URL;const key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error("Supabase Auth belum dikonfigurasi pada aplikasi.");
 authClient??=createClient(url,key,{auth:{storage:secureStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 return authClient;
}
export function getMobileApi(){
 const baseUrl=process.env.EXPO_PUBLIC_MOREAI_API_URL;if(!baseUrl)throw new Error("MoreAI API URL belum dikonfigurasi.");
 const auth=getMobileAuth();
 return createApiClient({baseUrl,getAccessToken:async()=>{const {data,error}=await auth.auth.getSession();if(error)throw new Error("Sesi autentikasi tidak dapat dibaca.");return data.session?.access_token??null;}});
}
