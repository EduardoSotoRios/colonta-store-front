// src/lib/supabase/server.ts
// Cliente Supabase para Server Components (solo lectura pública)
// Usa únicamente @supabase/supabase-js — no requiere @supabase/ssr

import { createClient } from '@supabase/supabase-js'

const AUTH_OPTS = { auth: { persistSession: false, autoRefreshToken: false } }

// Lectura pública — usa anon key, respeta RLS
// Las keys se leen dentro de la función (no a nivel de módulo) para que
// Amplify SSR Lambda las tenga disponibles en el momento de la llamada.
export async function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    AUTH_OPTS
  )
}

// Operaciones admin (INSERT/UPDATE/DELETE) — usa service role, bypasea RLS
export async function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    AUTH_OPTS
  )
}
