import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const AUTH_OPTS = { auth: { persistSession: false, autoRefreshToken: false } }

// Reads server-config.json baked into .next/ at build time by amplify.yml.
// Fallback for Amplify SSR Lambda which receives Console env vars at build
// time but not always at Lambda runtime.
let _baked: Record<string, string> | null = null
function bakedEnv(): Record<string, string> {
  if (_baked) return _baked
  try {
    const p = join(process.cwd(), '.next', 'server-config.json')
    _baked = JSON.parse(readFileSync(p, 'utf-8')) as Record<string, string>
  } catch {
    _baked = {}
  }
  return _baked
}

function get(key: string): string {
  return process.env[key] || bakedEnv()[key] || ''
}

export async function createSupabaseServerClient() {
  return createClient(
    get('NEXT_PUBLIC_SUPABASE_URL'),
    get('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    AUTH_OPTS
  )
}

export async function createSupabaseAdminClient() {
  return createClient(
    get('NEXT_PUBLIC_SUPABASE_URL'),
    get('SUPABASE_SERVICE_ROLE_KEY'),
    AUTH_OPTS
  )
}
