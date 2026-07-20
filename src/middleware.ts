// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Modo mantención: redirigir a /mantencion salvo admins
  if (process.env.MAINTENANCE_MODE === "true" && !pathname.startsWith("/admin")) {
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
    "/((?!_next/static|_next/image|favicon\\.ico|mantencion).*)",
  ],
};
