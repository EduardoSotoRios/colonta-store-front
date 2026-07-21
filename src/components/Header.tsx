"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCartUI } from "@/hooks/useCartUI";
import Image from "next/image";
import { useRouter } from "next/navigation";

const CATEGORIAS = [
  { label: "Mochilas",        slug: "mochilas"   },
  { label: "Bananos",         slug: "bananos"    },
  { label: "Bolsos",          slug: "bolsos"     },
  { label: "Porta Notebook",  slug: "notebook"   },
  { label: "Accesorios",      slug: "accesorios" },
];

export default function Header() {
  const { user, logout, hydrated } = useAuth();
  const { cart, loadCart } = useCart();
  const { toggleCart } = useCartUI();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    loadCart(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const getUserInitials = (nombre: string | undefined | null) =>
    (nombre ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const count = useMemo(
    () => Array.isArray(cart) ? cart.reduce((acc, it) => acc + it.quantity, 0) : 0,
    [cart]
  );

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-16 flex items-center gap-2 sm:gap-3 md:gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg px-2 py-2 hover:bg-slate-100"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="font-extrabold text-lg tracking-tight text-colonta-primary flex-shrink-0">
            <Image src="/logo.png" alt="Logotipo Colonta" width={150} height={150} className="h-12 w-auto sm:h-14 md:h-16" />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="ml-2 md:ml-4 hidden md:flex items-center gap-2 lg:gap-4 xl:gap-5 text-xs md:text-sm flex-shrink min-w-0">
          <Link href="/" className="hover:text-colonta-primary whitespace-nowrap">Inicio</Link>
          <Link href="/mochilas" className="hover:text-colonta-primary whitespace-nowrap">Productos</Link>
          <Link href="/mision-vision" className="hover:text-colonta-primary whitespace-nowrap hidden xl:inline">Nosotros</Link>
          <Link
            href="/personalizar"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-colonta-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Dale tu Sello
          </Link>
        </nav>

        <div className="flex-1 min-w-0" />

        {/* Acciones derechas */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
          <Link href="/seguimiento" className="hidden lg:inline-flex text-sm hover:text-colonta-primary px-2 lg:px-3 py-2 rounded-lg whitespace-nowrap">
            Seguimiento
          </Link>

          {/* Carrito */}
          <button
            onClick={toggleCart}
            className="relative inline-flex items-center rounded-xl border px-2 md:px-3 lg:px-4 py-2 hover:bg-slate-50 flex-shrink-0"
            aria-label="Abrir carrito"
          >
            <span aria-hidden className="text-base md:text-lg">🛒</span>
            {mounted && (
              <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-bold text-white bg-colonta-primary">
                {count}
              </span>
            )}
          </button>

          {/* Usuario / Login */}
          {!hydrated ? (
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
          ) : user ? (
            <div className="relative flex-shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-colonta-primary text-white font-semibold hover:opacity-90 transition-opacity text-xs md:text-sm"
                aria-label="Menú de usuario"
              >
                {getUserInitials(user.nombre)}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold text-slate-900">{user.nombre}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link href="/perfil" onClick={() => setUserMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    Mi Perfil
                  </Link>
                  {user.rol === "admin" && (
                    <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      Administración
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 md:gap-2 rounded-xl border px-2 md:px-3 lg:px-4 py-2 hover:bg-slate-50 text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              <span className="hidden sm:inline">Iniciar sesión</span>
              <span className="sm:hidden">Entrar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeMobile}
        />

        {/* Panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <span className="font-extrabold text-colonta-primary">Menú</span>
            <button onClick={closeMobile} className="rounded-lg px-3 py-2 hover:bg-slate-100">✕</button>
          </div>

          <nav className="p-4 space-y-1 text-sm bg-white">
            <Link href="/" className="block rounded-lg px-3 py-2 hover:bg-slate-50" onClick={closeMobile}>
              Inicio
            </Link>

            {/* Dale tu Sello CTA */}
            <Link
              href="/personalizar"
              onClick={closeMobile}
              className="flex items-center gap-2 rounded-xl bg-colonta-primary px-3 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Dale tu Sello
            </Link>

            {/* Productos con categorías expandibles */}
            <div>
              <button
                onClick={() => setMobileProductsOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 font-medium"
              >
                <span>Productos</span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {mobileProductsOpen && (
                <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-colonta-primary/20 pl-3">
                  {CATEGORIAS.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/mochilas?category=${cat.slug}`}
                      className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-600"
                      onClick={closeMobile}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/mision-vision" className="block rounded-lg px-3 py-2 hover:bg-slate-50" onClick={closeMobile}>
              Nosotros
            </Link>

            <div className="mt-4 border-t pt-4 space-y-1">
              <Link href="/seguimiento" className="block rounded-lg px-3 py-2 hover:bg-slate-50" onClick={closeMobile}>
                Seguimiento
              </Link>
            </div>

            {/* Usuario / Login en móvil */}
            <div className="mt-4 border-t pt-4">
              {!hydrated ? (
                <div className="px-3 py-2">
                  <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-1" />
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : user ? (
                <>
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm font-semibold text-slate-900">{user.nombre}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link href="/perfil" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-sm font-medium mb-1" onClick={closeMobile}>
                    Mi Perfil
                  </Link>
                  {user.rol === "admin" && (
                    <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-sm font-medium mb-1" onClick={closeMobile}>
                      Administración
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full text-left block rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link href="/login" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-sm font-medium" onClick={closeMobile}>
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>
        </aside>
      </div>
    </header>
  );
}
