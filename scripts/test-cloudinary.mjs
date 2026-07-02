// scripts/test-cloudinary.mjs
// Verifica que las credenciales de Cloudinary funcionan correctamente
import { v2 as cloudinary } from "cloudinary";

// Credenciales desde .env.local
const envVars = {};
const envPath = new URL("../.env.local", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("="); if (idx === -1) continue;
    envVars[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  }
}
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key:    envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

// 1. Subir imagen de prueba desde URL pública de Cloudinary demo
console.log("⬆️  Subiendo imagen de prueba...");
const upload = await cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { public_id: "colonta_test_sample", overwrite: true }
);

console.log("✅ Imagen subida:");
console.log("   URL:       ", upload.secure_url);
console.log("   Public ID: ", upload.public_id);

// 2. Obtener detalles de la imagen
console.log("\n📋 Detalles de la imagen:");
console.log("   Ancho:     ", upload.width, "px");
console.log("   Alto:      ", upload.height, "px");
console.log("   Formato:   ", upload.format);
console.log("   Tamaño:    ", upload.bytes, "bytes");

// 3. Generar URL con transformaciones automáticas
// f_auto: selecciona el formato óptimo según el navegador (WebP, AVIF, etc.)
// q_auto: comprime automáticamente sin perder calidad visible
const transformedUrl = cloudinary.url(upload.public_id, {
  fetch_format: "auto", // f_auto
  quality: "auto",      // q_auto
  secure: true,
});

console.log("\n🔗 URL optimizada (f_auto + q_auto):");
console.log("  ", transformedUrl);
console.log("\nDone! Abre el link de arriba para ver la versión optimizada.");
