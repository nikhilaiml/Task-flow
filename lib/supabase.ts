// Supabase se connect karne ke liye client
// Lazy initialization: client sirf tab banega jab pehli baar use hoga,
// taaki build time par (Jab env vars set na hon) import crash na kare.
import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
      )
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient, _receiver) {
    const client = getSupabase()
    const value = (client as unknown as Record<string, unknown>)[prop]
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  },
})