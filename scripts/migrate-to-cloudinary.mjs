// scripts/migrate-to-cloudinary.mjs
// Migra todas las imágenes de Supabase Storage → Cloudinary
// y actualiza las URLs en producto_imagenes.
//
// Uso: node scripts/migrate-to-cloudinary.mjs
//
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

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

const SUPABASE_URL  = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY   = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Faltan variables en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Configurar Cloudinary (credenciales desde .env.local) ────────────────────
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key:    envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

// ── Obtener imágenes a migrar ─────────────────────────────────────────────────
const { data: imagenes, error: dbErr } = await supabase
  .from("producto_imagenes")
  .select("id, url, producto_id");

if (dbErr) { console.error("❌ Error leyendo BD:", dbErr.message); process.exit(1); }

const pendientes = imagenes.filter(i =>
  i.url && i.url.includes("supabase.co/storage")
);

const yaEnCloudinary = imagenes.filter(i =>
  i.url && i.url.includes("cloudinary.com")
);

console.log(`📊 Total imágenes en BD:     ${imagenes.length}`);
console.log(`✅ Ya en Cloudinary:          ${yaEnCloudinary.length}`);
console.log(`⏳ Para migrar (Supabase):    ${pendientes.length}\n`);

if (pendientes.length === 0) {
  console.log("✅ Todas las imágenes ya están en Cloudinary.");
  process.exit(0);
}

let migradas = 0, errores = 0;

for (const img of pendientes) {
  const { id, url } = img;

  // Derivar public_id desde el nombre del archivo en Supabase
  // URL ejemplo: https://xxx.supabase.co/storage/v1/object/public/productos/Bananos/Banano_Simple.png
  const filename = url.split("/").pop() ?? `imagen_${id}`;
  const nameNoExt = filename.replace(/\.[^.]+$/, "");
  const publicId  = `colonta/productos/${nameNoExt}`;

  try {
    // Subir desde URL de Supabase directamente a Cloudinary
    const result = await cloudinary.uploader.upload(url, {
      public_id:  publicId,
      overwrite:  true,
      resource_type: "image",
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
❌ Errores:   ${errores}
────────────────────────────────`);
