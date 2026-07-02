// src/components/CartBootstrap.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function CartBootstrap() {
  const { user } = useAuth();
  const { cart, loadCart } = useCart();
  
  useEffect(() => {
    // Cargar el carrito (local si no hay usuario, servidor si hay usuario)
    if (cart.length === 0) {
      loadCart(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  return null;
}