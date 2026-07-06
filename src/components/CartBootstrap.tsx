// src/components/CartBootstrap.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function CartBootstrap() {
  const { user, hydrated, hydrate } = useAuth();
  const { loadCart } = useCart();

  useEffect(() => {
    // Restaura la sesión (si la cookie sigue válida) apenas carga la app
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    // Cargar el carrito real (local si no hay usuario, servidor si hay usuario).
    // El carrito ya se pinta de inmediato desde el cache (ver useCart.ts) apenas
    // carga la app, asi que esto solo confirma/corrige ese valor en segundo plano
    // sin que el usuario vea un estado vacio mientras tanto — por eso corre
    // siempre que cambia la sesion, sin importar si el cache ya traia items.
    if (hydrated) {
      loadCart(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  return null;
}