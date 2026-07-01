// src/lib/supabase/server.ts
// Cliente Supabase para Server Components (solo lectura pública)
// Usa únicamente @supabase/supabase-js — no requiere @supabase/ssr

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente singleton para uso en Server Components y Server Actions
// La anon key solo puede leer datos públicos (productos activos)
// según las políticas RLS que definimos en el schema
export async function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,   // en servidor no hay sesión de usuario
      autoRefreshToken: false,
    },
  })
}