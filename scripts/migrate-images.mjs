// scripts/migrate-images.mjs
// Sube todas las imágenes de public/Producto/ a Supabase Storage
// y actualiza las URLs en producto_imagenes.
//
// Uso: node scripts/migrate-images.mjs
//
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

// ── Leer .env.local manualmente (sin dotenv) ──────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env.local");

const envVars = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    envVars[key] = val;
  }
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = envVars.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = "productos";
const PUBLIC_DIR   = path.join(rootDir, "public");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Recopilar todos los archivos de imagen locales ─────────────────────────
function collectFiles(dir, base = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, base));
    } else if (/\.(png|jpg|jpeg|webp|gif)$/i.test(entry.name)) {
      // Ruta relativa desde public/ → "/Producto/Bananos/..."
      results.push("/" + path.relative(base, fullPath).replace(/\\/g, "/"));
    }
  }
  return results;
}

const productoDir = path.join(PUBLIC_DIR, "Producto");
const localFiles  = collectFiles(productoDir, PUBLIC_DIR);
// Mapa: ruta relativa (lowercase) → ruta relativa real
const localMap = new Map(localFiles.map(f => [f.toLowerCase(), f]));

console.log(`📁 ${localFiles.length} archivos locales encontrados en public/Producto/\n`);

// ── Obtener todas las imágenes de la BD ───────────────────────────────────
const { data: imagenes, error: dbErr } = await supabase
  .from("producto_imagenes")
  .select("id, url, producto_id");

if (dbErr) { console.error("❌ Error leyendo BD:", dbErr.message); process.exit(1); }

console.log(`🗄️  ${imagenes.length} registros en producto_imagenes\n`);

let subidas = 0, actualizadas = 0, omitidas = 0, errores = 0;

for (const img of imagenes) {
  const { id, url } = img;

  // Ya tiene URL de Supabase Storage → saltar
  if (url && url.includes("supabase.co/storage")) {
    omitidas++;
    continue;
  }

  // Extraer el path relativo desde la URL almacenada
  // Soporta: "http://localhost:3000/Producto/...", "/Producto/...", etc.
  let relativePath = url ?? "";
  relativePath = relativePath.replace(/^https?:\/\/[^/]+/, ""); // quitar host
  relativePath = decodeURIComponent(relativePath);               // decodificar %20 → espacio
  if (!relativePath) { omitidas++; continue; }

  // Buscar el archivo local (case-insensitive)
  const localRel = localMap.get(relativePath.toLowerCase());
  if (!localRel) {
    console.warn(`  ⚠️  No encontrado localmente: ${relativePath}`);
    omitidas++;
    continue;
  }

  const localAbsPath = path.join(PUBLIC_DIR, localRel);
  const fileBuffer   = fs.readFileSync(localAbsPath);
  const ext          = path.extname(localRel).slice(1).toLowerCase();
  const mimeMap      = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
  const contentType  = mimeMap[ext] ?? "image/jpeg";

  // Nombre en Storage: sin espacios ni tildes (Supabase Storage solo acepta ASCII)
  function toAscii(str) {
    const map = { "\xE1":"a","\xE0":"a","\xE2":"a","\xE4":"a",
                  "\xE9":"e","\xE8":"e","\xEA":"e","\xEB":"e",
                  "\xED":"i","\xEC":"i","\xEE":"i","\xEF":"i",
                  "\xF3":"o","\xF2":"o","\xF4":"o","\xF6":"o",
                  "\xFA":"u","\xF9":"u","\xFB":"u","\xFC":"u",
                  "\xF1":"n","\xF3":"o","\xF3":"o" };
    return str.split("").map(c => map[c] ?? c).join("");
  }
  const storageName = toAscii(localRel
    .replace(/^\/Producto\//i, "")
    .replace(/\s+/g, "_"));

  // Subir (upsert para poder re-ejecutar el script)
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storageName, fileBuffer, { contentType, upsert: true });

  if (uploadErr) {
    console.error(`  ❌ Error subiendo ${storageName}: ${uploadErr.message}`);
    errores++;
    continue;
  }
  subidas++;

  // Obtener URL pública
  const { data: pubData } = supabase.storage.from(BUCKET).getPublicUrl(storageName);
  const publicUrl = pubData.publicUrl;

  // Actualizar registro en BD
  const { error: updateErr } = await supabase
    .from("producto_imagenes")
    .update({ url: publicUrl })
    .eq("id", id);

  if (updateErr) {
    console.error(`  ❌ Error actualizando BD id=${id}: ${updateErr.message}`);
    errores++;
  } else {
    actualizadas++;
    console.log(`  ✅ ${storageName}`);
  }
}

console.log(`
────────────────────────────────
✅ Subidas:     ${subidas}
✅ Actualizadas: ${actualizadas}
⏭️  Omitidas:   ${omitidas}
❌ Errores:     ${errores}
────────────────────────────────`);
