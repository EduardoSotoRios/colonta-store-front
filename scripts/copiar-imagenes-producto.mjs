// scripts/copiar-imagenes-producto.mjs
// Copia las imágenes de un producto a otro.
//
// Uso: node scripts/copiar-imagenes-producto.mjs
//
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath   = path.join(__dirname, "..", ".env.local");

const envVars = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  }
}

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ── Configuración ─────────────────────────────────────────────────────────────
const ORIGEN  = "Mochila Ligera";
const DESTINO = "Mochila Ligera Tirantes Gruesos";
// ─────────────────────────────────────────────────────────────────────────────

const { data: productos } = await supabase
  .from("productos")
  .select("id, nombre")
  .in("nombre", [ORIGEN, DESTINO]);

const origen  = productos?.find(p => p.nombre === ORIGEN);
const destino = productos?.find(p => p.nombre === DESTINO);

if (!origen)  { console.error(`❌ No encontrado: "${ORIGEN}"`);  process.exit(1); }
if (!destino) { console.error(`❌ No encontrado: "${DESTINO}"`); process.exit(1); }

console.log(`✅ Origen:  ${origen.nombre}  (${origen.id})`);
console.log(`✅ Destino: ${destino.nombre} (${destino.id})\n`);

// Obtener imágenes del origen
const { data: imagenes, error } = await supabase
  .from("producto_imagenes")
  .select("url, alt, principal, orden, color, color_secundario, color_terciario, color_cuaternario")
  .eq("producto_id", origen.id)
  .order("orden");

if (error) { console.error("❌ Error leyendo imágenes:", error.message); process.exit(1); }
if (!imagenes?.length) { console.log("⚠️  El producto origen no tiene imágenes."); process.exit(0); }

console.log(`📷 ${imagenes.length} imágenes a copiar:`);
imagenes.forEach(img => console.log(`   • ${img.url}`));

// Verificar si el destino ya tiene imágenes
const { data: existentes } = await supabase
  .from("producto_imagenes")
  .select("id")
  .eq("producto_id", destino.id);

if (existentes?.length) {
  console.log(`\n⚠️  El destino ya tiene ${existentes.length} imagen(es). Se agregarán las del origen encima.`);
}

// Insertar
const rows = imagenes.map(img => ({ ...img, producto_id: destino.id }));
const { error: insertError } = await supabase.from("producto_imagenes").insert(rows);

if (insertError) {
  console.error("❌ Error insertando:", insertError.message);
  process.exit(1);
}

console.log(`\n✅ ${imagenes.length} imágenes copiadas a "${DESTINO}".`);
