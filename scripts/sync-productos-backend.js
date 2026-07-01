// scripts/sync-productos-backend.js
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const BACKEND     = (process.env.BACKEND_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORIA_MAP = {
  mochilas:   "mochilas",
  bananos:    "bananos",
  bolsos:     "bolsos",
  notebook:   "notebook",
  accesorios: "accesorios",
};

async function getAuthCookie() {
  const res = await fetch(`${BACKEND}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login fallido: ${res.status} ${await res.text()}`);

  // Extraer la cookie auth_token del header Set-Cookie
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error("No se recibió cookie del backend");

  const match = setCookie.match(/auth_token=([^;]+)/);
  if (!match) throw new Error("No se encontró auth_token en la cookie");

  return match[1];
}

async function crearProducto(cookie, producto) {
  const res = await fetch(`${BACKEND}/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `auth_token=${cookie}`,
    },
    body: JSON.stringify(producto),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
  return res.json();
}

async function sync() {
  console.log("🔄 Sincronizando productos de Supabase → backend...\n");

  // 1. Login y obtener cookie
  let cookie;
  try {
    cookie = await getAuthCookie();
    console.log("✅ Login en backend OK\n");
  } catch (e) {
    console.error("❌ No se pudo hacer login:", e.message);
    process.exit(1);
  }

  // 2. Leer productos de Supabase
  const { data, error } = await supabase
    .from("productos_completos")
    .select("*, producto_imagenes(*)")
    .order("categoria_id", { ascending: true })
    .order("orden",        { ascending: true });

  if (error) {
    console.error("❌ Error leyendo Supabase:", error.message);
    process.exit(1);
  }

  console.log(`📦 ${data.length} productos encontrados en Supabase\n`);

  let ok = 0, fail = 0;

  for (const p of data) {
    const rawUrl = p.producto_imagenes?.find(i => i.principal)?.url
                ?? p.producto_imagenes?.[0]?.url
                ?? null;

    const PLACEHOLDER = "https://placehold.co/400x500/png";
    const imageUrl = rawUrl && rawUrl.startsWith("http") ? rawUrl : PLACEHOLDER;

    const payload = {
      name:             p.nombre,
      slug:             p.slug,
      category:         CATEGORIA_MAP[p.categoria_slug] ?? p.categoria_slug,
      basePrice:        Math.round(Number(p.precio ?? 0)),
      baseWeightGrams:  Math.round(Number(p.peso_g ?? 0)),
      imageUrl:         imageUrl,
      allowCustomColors: Boolean(p.personalizable),
      colorSchemes:     [],
      extras:           [],
    };

    try {
      const creado = await crearProducto(cookie, payload);
      console.log(`  ✅ ${p.emoji ?? ""} ${p.nombre} → id backend: ${creado.id}`);
      ok++;
    } catch (e) {
      console.error(`  ❌ ${p.nombre}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n🎉 Sync completado: ${ok} creados${fail ? `, ${fail} con errores` : ""}.`);
}

sync().catch(console.error);