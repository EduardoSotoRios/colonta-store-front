// src/components/CartBootstrap.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function CartBootstrap() {
  const { user, hydrated, hydrate } = useAuth();
  const { cart, loadCart } = useCart();

  useEffect(() => {
    // Restaura la sesión (si la cookie sigue válida) apenas carga la app
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    // Cargar el carrito (local si no hay usuario, servidor si hay usuario)
    // Se espera a que termine la restauración de sesión para no cargar
    // el carrito de invitado por error mientras el usuario sigue logueado.
    if (hydrated && cart.length === 0) {
      loadCart(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  return null;
}