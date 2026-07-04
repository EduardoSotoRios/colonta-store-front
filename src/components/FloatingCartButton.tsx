"use client";

import { useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import { useCartUI } from "@/hooks/useCartUI";

export default function FloatingCartButton() {
  const { cart } = useCart();
  const { openCart, isCartOpen } = useCartUI();

  // Calcular cantidad total de productos en el carrito
  const count = useMemo(
    () => Array.isArray(cart) ? cart.reduce((acc, it) => acc + it.quantity, 0) : 0,
    [cart]
  );

  // Si el carrito está vacío o ya está abierto, no mostrar el botón
  // (si no, queda tapando al botón "Ver carrito" del panel en mobile)
  if (!count || isCartOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <button
        onClick={openCart}
        className="relative inline-flex items-center gap-2 rounded-full shadow-lg px-4 py-3 bg-colonta-primary text-white font-semibold"
        aria-label="Ver carrito"
      >
        🛒
        <span>Ver carrito</span>
        <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-bold text-colonta-primary bg-white">
          {count}
        </span>
      </button>
    </div>
  );
}