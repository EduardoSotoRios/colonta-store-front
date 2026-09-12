import { createClient } from '@supabase/supabase-js'

const AUTH_OPTS = { auth: { persistSession: false, autoRefreshToken: false } }

export async function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    AUTH_OPTS
  )
}

export async function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    AUTH_OPTS
  )
}
