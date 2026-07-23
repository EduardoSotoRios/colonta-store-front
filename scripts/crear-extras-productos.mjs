// scripts/crear-extras-productos.mjs
// Crea los extras en el backend y los asigna a los productos correspondientes.
//
// Uso: node scripts/crear-extras-productos.mjs
//
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const API     = "https://colonta-api-production.up.railway.app/api";
const EMAIL   = envVars.ADMIN_EMAIL    ?? "admin@colonta.com";
const PASS    = envVars.ADMIN_PASSWORD ?? "";

if (!PASS) { console.error("❌ ADMIN_PASSWORD no encontrado en .env.local"); process.exit(1); }

// ── Definición de extras por nombre exacto del backend ───────────────────────
// Nombres obtenidos de GET /api/models el 2026-07-23
const EXTRAS_POR_CATEGORIA = {
  // Mochila Normal cubre Viajeras, Urbanas, Arcoiris (tienen los mismos extras)
  "Mochila Normal (Diseñada)": [
    "Bolsillo Espalda", "Cinta Matt Yoga", "Cintas Saco",
    "Cintas Reflectantes", "2 Tip top Tapa", "Cintas Cintura", "Cintas Pecho",
  ],
  // Mochila Ligera y variante Tirantes Gruesos usan el mismo modelo
  "Mochila Ligera (Diseñada)": [
    "Bolsillo Espalda", "Cintas Reflectantes",
  ],
  // Banano genérico cubre Viajero, Urbano, Pop
  "Banano (Diseñado)":         ["Cinta Reflectante"],
  "Banano Muslera (Diseñado)": ["Cinta Reflectante"],
  "Banano Simple (Diseñado)":  ["Cinta Reflectante"],
};

const PRECIO_EXTRA = 1000;

// ── Login ─────────────────────────────────────────────────────────────────────
console.log("🔐 Iniciando sesión como admin...");
const loginRes = await fetch(`${API}/auth/login`, {
  method:  "POST",
  headers: { "Content-Type": "application/json" },
  body:    JSON.stringify({ email: EMAIL, password: PASS }),
});
if (!loginRes.ok) {
  console.error("❌ Login fallido:", await loginRes.text()); process.exit(1);
}
const setCookie = loginRes.headers.get("set-cookie") ?? "";
const authCookie = setCookie.split(";")[0]; // auth_token=xxx
console.log("✅ Login OK\n");

const headers = { "Content-Type": "application/json", Cookie: authCookie };

// ── Obtener extras existentes ─────────────────────────────────────────────────
const extrasRes  = await fetch(`${API}/extras`, { headers });
const existentes = extrasRes.ok ? await extrasRes.json() : [];
console.log(`📋 Extras existentes: ${existentes.length}`);

// Mapa nombre → id para extras ya creados
const extrasMap = new Map(existentes.map((e) => [e.name.toLowerCase().trim(), e.id]));

// ── Crear extras que falten ───────────────────────────────────────────────────
const todosLosNombres = [...new Set(Object.values(EXTRAS_POR_CATEGORIA).flat())];
console.log(`\n🛠  Extras a garantizar (${todosLosNombres.length}):`);

for (const nombre of todosLosNombres) {
  if (extrasMap.has(nombre.toLowerCase())) {
    console.log(`  ⏭  Ya existe: ${nombre}`);
    continue;
  }
  const res  = await fetch(`${API}/extras`, {
    method:  "POST",
    headers,
    body:    JSON.stringify({ name: nombre, description: "", price: PRECIO_EXTRA }),
  });
  if (!res.ok) {
    console.error(`  ❌ Error creando "${nombre}":`, await res.text()); continue;
  }
  const creado = await res.json();
  extrasMap.set(nombre.toLowerCase(), creado.id);
  console.log(`  ✅ Creado: ${nombre} (id=${creado.id})`);
}

// ── Obtener modelos de producto del backend ───────────────────────────────────
console.log("\n📦 Obteniendo productos del backend...");
const modelsRes = await fetch(`${API}/models`, { headers });
if (!modelsRes.ok) {
  console.error("❌ Error obteniendo productos:", await modelsRes.text()); process.exit(1);
}
const models = await modelsRes.json();
console.log(`   ${models.length} productos encontrados\n`);

// ── Asignar extras a cada producto ────────────────────────────────────────────
let asignados = 0, errores = 0;

for (const [nombreProducto, nombresExtras] of Object.entries(EXTRAS_POR_CATEGORIA)) {
  // Buscar el modelo por nombre exacto
  const modelo = models.find((m) => m.name === nombreProducto);

  if (!modelo) {
    console.warn(`  ⚠️  Producto no encontrado en backend: "${nombreProducto}"`);
    continue;
  }

  const extraIds = nombresExtras
    .map((n) => extrasMap.get(n.toLowerCase()))
    .filter(Boolean);

  const res = await fetch(`${API}/models/${modelo.id}`, {
    method:  "PUT",
    headers,
    body:    JSON.stringify({ colorSchemeIds: undefined, extraIds }),
  });

  if (!res.ok) {
    console.error(`  ❌ Error asignando extras a "${modelo.name}":`, await res.text());
    errores++;
  } else {
    console.log(`  ✅ "${modelo.name}" → ${extraIds.length} extras asignados`);
    asignados++;
  }
}

console.log(`
────────────────────────────────
✅ Productos con extras: ${asignados}
❌ Errores:              ${errores}
────────────────────────────────`);
