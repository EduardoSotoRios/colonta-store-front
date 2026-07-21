// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Modo mantención: redirigir a /mantencion salvo admins o preview bypass
  if (process.env.MAINTENANCE_MODE === "true" && !pathname.startsWith("/admin") && pathname !== "/login") {
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

  // Verificar token con el backend
  try {
    const res = await fetch(`${BACKEND}/auth/me`, {
      headers: { Cookie: `auth_token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) return redirectToLogin(req);

    const user = await res.json();

    // Solo admins pueden acceder
    if (user.rol !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
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
