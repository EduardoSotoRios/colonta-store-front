// scripts/guardar-backend-ids.js
// Lee los productos del backend y guarda sus IDs en Supabase (campo backend_id)
// Uso: node scripts/guardar-backend-ids.js

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const BACKEND     = (process.env.BACKEND_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getAuthCookie() {
  const res = await fetch(`${BACKEND}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login fallido: ${res.status}`);
  const setCookie = res.headers.get("set-cookie");
  const match = setCookie?.match(/auth_token=([^;]+)/);
  if (!match) throw new Error("No se encontró auth_token");
  return match[1];
}

async function sync() {
  console.log("🔗 Guardando IDs del backend en Supabase...\n");

  // 1. Primero agregar columna backend_id si no existe
  await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE productos ADD COLUMN IF NOT EXISTS backend_id TEXT UNIQUE;"
  }).catch(() => {}); // ignorar si ya existe

  // 2. Login en backend
  const cookie = await getAuthCookie();
  console.log("✅ Login OK\n");

  // 3. Obtener todos los productos del backend
  const res = await fetch(`${BACKEND}/models?limit=9999`, {
    headers: { "Cookie": `auth_token=${cookie}` },
  });
  if (!res.ok) throw new Error(`Error obteniendo productos: ${res.status}`);
  const backendProducts = await res.json();
  console.log(`📦 ${backendProducts.length} productos en el backend\n`);

  // 4. Obtener productos de Supabase
  const { data: supabaseProducts, error } = await supabase
    .from("productos")
    .select("id, slug, nombre");
  if (error) throw new Error(`Error Supabase: ${error.message}`);

  let ok = 0, fail = 0;

  for (const bp of backendProducts) {
    // Buscar por slug
    const sp = supabaseProducts.find(p => p.slug === bp.slug);
    if (!sp) {
      console.warn(`  ⚠️  No encontrado en Supabase: ${bp.slug}`);
      fail++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("productos")
      .update({ backend_id: bp.id })
      .eq("id", sp.id);

    if (updateError) {
      console.error(`  ❌ ${bp.slug}: ${updateError.message}`);
      fail++;
    } else {
      console.log(`  ✅ ${bp.slug} → backend_id: ${bp.id}`);
      ok++;
    }
  }

  console.log(`\n🎉 Completado: ${ok} actualizados${fail ? `, ${fail} con errores` : ""}.`);
}

sync().catch(console.error);
