// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Para fetch en middleware (Node.js server): siempre necesita URL absoluta.
// Usa RAILWAY_API_URL (la URL real del backend) o el fallback hardcodeado.
// NUNCA usar NEXT_PUBLIC_API_URL aquí porque puede ser una ruta relativa ("/api").
const BACKEND = (
  process.env.RAILWAY_API_URL
    ? `${process.env.RAILWAY_API_URL}/api`
    : "https://colonta-api-sz8z.onrender.com/api"
).replace(/\/+$/, "");

// El modo mantención activable desde Admin > Mantenimiento se guarda en
// Supabase (tabla site_settings), no en una variable de entorno — así el
// admin lo prende/apaga al instante sin redeploy. Esta consulta tiene que
// "fallar abierta": si Supabase no responde o hay cualquier error, se trata
// como que NO está en mantención, para que un problema de red nunca termine
// bloqueando el sitio entero para todo el mundo.
async function mantencionActivaEnBD(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/rest/v1/site_settings?select=mantenimiento&id=eq.1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const rows = await res.json();
    return rows?.[0]?.mantenimiento === true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Modo mantención: redirigir a /mantencion salvo admins o preview bypass.
  // /admin y /login quedan SIEMPRE afuera de este bloqueo (ver condición de
  // abajo) — así el admin nunca puede quedar encerrado afuera del panel por
  // este mecanismo, sin importar qué tan mal salga algo.
  if (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/") &&
    pathname !== "/login" &&
    (process.env.MAINTENANCE_MODE === "true" || (await mantencionActivaEnBD()))
  ) {
    const previewKey = req.nextUrl.searchParams.get("preview");
    const previewCookie = req.cookies.get("preview_bypass")?.value;
    const secret = process.env.MAINTENANCE_PREVIEW_KEY;

    // Si viene con ?preview=<clave> correcta, setear cookie y dejar pasar
    if (secret && previewKey === secret) {
      const res = NextResponse.next();
      res.cookies.set("preview_bypass", secret, { path: "/", httpOnly: true, maxAge: 60 * 60 * 8 });
      return res;
    }

    // Si ya tiene la cookie de bypass, dejar pasar
    if (secret && previewCookie === secret) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/mantencion", req.url));
  }

  // Solo proteger rutas /admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Leer cookie del backend
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return redirectToLogin(req);
  }

  // Verificar token con el backend (timeout 8s: Render free puede tardar en despertar)
  try {
    const res = await fetch(`${BACKEND}/auth/me`, {
      headers: { Cookie: `auth_token=${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return redirectToLogin(req);

    const user = await res.json();

    // Solo admins pueden acceder
    if (user.rol !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Verificación de PIN — excluir la propia página de verificación
    if (pathname !== "/admin/verificar") {
      const pin         = process.env.ADMIN_VERIFY_PIN;
      const cookiePin   = req.cookies.get("admin_verified")?.value;
      if (pin && cookiePin !== pin) {
        const dest = new URL("/admin/verificar", req.url);
        dest.searchParams.set("redirect", pathname);
        return NextResponse.redirect(dest);
      }
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon\\.ico|mantencion|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)).*)",
  ],
};
