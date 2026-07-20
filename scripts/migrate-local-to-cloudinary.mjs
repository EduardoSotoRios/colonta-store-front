// scripts/migrate-local-to-cloudinary.mjs
// Sube imágenes estáticas de public/Producto/ a Cloudinary
// y actualiza las URLs en producto_imagenes.
//
// Uso: node scripts/migrate-local-to-cloudinary.mjs
// Flags:
//   --dry-run   Lista las imágenes a procesar sin subir ni actualizar BD
//
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

const DRY_RUN = process.argv.includes("--dry-run");

// ── Leer .env.local ──────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir   = path.join(__dirname, "..");
const envPath   = path.join(rootDir, ".env.local");

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

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

if (!envVars.CLOUDINARY_CLOUD_NAME || !envVars.CLOUDINARY_API_KEY || !envVars.CLOUDINARY_API_SECRET) {
  console.error("❌ Faltan CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key:    envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

// ── Construir mapa de archivos locales (case-insensitive) ────────────────────
const PUBLIC_DIR = path.join(rootDir, "public");

function collectFiles(dir, base = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectFiles(fullPath, base));
    else if (/\.(png|jpg|jpeg|webp|gif)$/i.test(entry.name))
      results.push("/" + path.relative(base, fullPath).replace(/\\/g, "/"));
  }
  return results;
}

const localFiles = collectFiles(path.join(PUBLIC_DIR, "Producto"), PUBLIC_DIR);
// Normaliza para comparación: lowercase + espacios colapsados + trim
const normalise = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
const localMap  = new Map(localFiles.map(f => [normalise(f), f]));

// ── Consultar BD ─────────────────────────────────────────────────────────────
const { data: imagenes, error: dbErr } = await supabase
  .from("producto_imagenes")
  .select("id, url, producto_id");

if (dbErr) { console.error("❌ Error leyendo BD:", dbErr.message); process.exit(1); }

const pendientes = imagenes.filter(i =>
  i.url && i.url.startsWith("/Producto/")
);
const yaEnCloudinary = imagenes.filter(i =>
  i.url && i.url.includes("cloudinary.com")
);

console.log(`📊 Total registros en BD:     ${imagenes.length}`);
console.log(`✅ Ya en Cloudinary:           ${yaEnCloudinary.length}`);
console.log(`⏳ Pendientes (/Producto/):    ${pendientes.length}`);
if (DRY_RUN) console.log("🔍 MODO DRY-RUN — no se subirá nada\n");
console.log();

if (pendientes.length === 0) {
  console.log("✅ Todas las imágenes ya están en Cloudinary.");
  process.exit(0);
}

// ── Migrar ───────────────────────────────────────────────────────────────────
let migradas = 0, omitidas = 0, errores = 0;

for (const img of pendientes) {
  const { id, url } = img;

  // Decodificar y buscar en disco (case-insensitive)
  const decoded  = decodeURIComponent(url).replace(/\s+$/, ""); // quitar espacios al final
  const localRel = localMap.get(normalise(decoded));

  if (!localRel) {
    console.warn(`  ⚠️  [id=${id}] Archivo no encontrado en disco: ${decoded}`);
    omitidas++;
    continue;
  }

  const localPath = path.join(PUBLIC_DIR, localRel);
  const filename  = path.basename(localRel);
  const nameNoExt = filename.replace(/\.[^.]+$/, "").trim();
  // public_id estable, basado en el nombre del archivo (sin extensión ni espacios)
  const publicId  = `colonta/productos/${nameNoExt.replace(/\s+/g, "_")}`;

  if (DRY_RUN) {
    console.log(`  🔍 [id=${id}] ${localRel} → ${publicId}`);
    migradas++;
    continue;
  }

  try {
    const buffer = fs.readFileSync(localPath);

    // Subir usando upload_stream (igual que subirImagenStorage en actions.ts)
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: "image", overwrite: true },
        (err, res) => { if (err || !res) reject(err ?? new Error("Sin respuesta")); else resolve(res); }
      ).end(buffer);
    });

    // URL optimizada con f_auto y q_auto
    const newUrl = cloudinary.url(result.public_id, {
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });

    // Actualizar BD
    const { error: updateErr } = await supabase
      .from("producto_imagenes")
      .update({ url: newUrl })
      .eq("id", id);

    if (updateErr) {
      console.error(`  ❌ [id=${id}] Error BD: ${updateErr.message}`);
      errores++;
    } else {
      migradas++;
      console.log(`  ✅ [${migradas}/${pendientes.length}] ${filename}`);
    }
  } catch (e) {
    console.error(`  ❌ [id=${id}] Error subiendo ${filename}: ${e.message}`);
    errores++;
  }
}

console.log(`
────────────────────────────────
✅ Migradas:  ${migradas}
⏭️  Omitidas:  ${omitidas}
❌ Errores:   ${errores}
────────────────────────────────`);

if (errores > 0) process.exit(1);
