// src/lib/supabase/server.ts
// Cliente Supabase para Server Components (solo lectura pública)
// Usa únicamente @supabase/supabase-js — no requiere @supabase/ssr

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const AUTH_OPTS = { auth: { persistSession: false, autoRefreshToken: false } }

// Lectura pública — usa anon key, respeta RLS
export async function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, AUTH_OPTS)
}

// Operaciones admin (INSERT/UPDATE/DELETE) — usa service role, bypasea RLS
export async function createSupabaseAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, AUTH_OPTS)
}