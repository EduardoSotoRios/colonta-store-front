"use client";
// src/components/AddToCartInlineButton.tsx

import { useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem } from "@/lib/api";

export default function AddToCartInlineButton({
  productId,
  colorSchemeId,
  colorScheme,
  extras = [],
}: {
  productId: string;
  colorSchemeId?: string;
  colorScheme?: { type: 'custom'; colors: string[] };
  extras?: string[];
}) {
  const { user }    = useAuth();
  const { addItem } = useCart();

  const onClick = useCallback(async () => {
    const item: CartItem = {
      productModelId: productId,
      quantity: 1,
      extras: extras || [],
    };

    if (colorSchemeId) {
      item.colorSchemeId = colorSchemeId;
    } else if (colorScheme) {
      item.colorScheme = { type: 'custom', colors: colorScheme.colors || [] };
    }

    await addItem(item, user);
  }, [addItem, productId, colorSchemeId, colorScheme, extras, user]);

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center w-full rounded-xl px-3 py-2 text-sm font-semibold text-white bg-colonta-primary hover:opacity-90"
    >
      Agregar al carrito
    </button>
  );
}