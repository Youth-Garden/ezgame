import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SERVER_ENV } from "@/shared/constants/server";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createClient(
    SERVER_ENV.SUPABASE_URL,
    SERVER_ENV.SUPABASE_ANON_KEY,
    {
      realtime: {
        params: {
          eventsPerSecond: 40,
        },
      },
    }
  );

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const url = SERVER_ENV.SUPABASE_URL;
  const key = SERVER_ENV.SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("example.supabase.co") &&
    !url.includes("placeholder") &&
    !key.includes("dummy_key")
  );
}

export const supabase = getSupabaseClient();
