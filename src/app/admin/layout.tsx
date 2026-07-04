// src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated && (!user || user.rol !== "admin")) {
      router.push("/login");
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user || user.rol !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Verificando acceso…</p>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin/productos",  label: "Productos",  icon: "🎒" },
    { href: "/admin/banners",    label: "Banners",    icon: "🖼️" },
    { href: "/admin/colores",    label: "Colores",    icon: "🎨" },
    { href: "/admin/extras",     label: "Extras",     icon: "➕" },
    { href: "/admin/cupones",    label: "Cupones",    icon: "🏷️" },
    { href: "/admin/pedidos",    label: "Pedidos",    icon: "📦" },
    { href: "/admin/usuarios",   label: "Usuarios",   icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-slate-200 z-40 flex flex-col">
        <div className="p-5 border-b border-slate-200">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Panel Admin</p>
          <p className="text-lg font-extrabold text-colonta-primary mt-0.5">Colonta</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname.startsWith(href)
                  ? "bg-colonta-primary/10 text-colonta-primary"
                  : "text-slate-700 hover:bg-slate-50 hover:text-colonta-primary"
              }`}
            >
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <p className="text-xs text-slate-400 truncate px-3">{user.nombre}</p>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
