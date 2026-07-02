// src/components/CartSidebar.tsx
"use client";

import { useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCartUI } from "@/hooks/useCartUI";
import { getColorEmoji } from "@/lib/colores-map";
import Link from "next/link";
import type { ProductModel } from "@/lib/api";

type ImagenColor = { nombre: string; hex: string | null };
type Imagen = NonNullable<ProductModel['imagenes']>[number];

function ColorBadge({ nombre, hex }: { nombre: string; hex: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
      {hex
        ? <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: hex }} />
        : <span className="text-xs leading-none">{getColorEmoji(nombre) ?? "🎨"}</span>
      }
      {nombre}
    </span>
  );
}

export default function CartSidebar() {
  const { user } = useAuth();
  const { cart, products, updateItem, removeItem } = useCart();
  const { isCartOpen, closeCart } = useCartUI();

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products[item.productModelId];
      if (!product) return sum;
      let itemPrice = Number(product.basePrice);
      if (item.extras && item.extras.length > 0) {
        const productExtras = product.extras || [];
        item.extras.forEach(extraId => {
          const extra = productExtras.find(e => e.id === extraId);
          if (extra) itemPrice += Number(extra.price);
        });
      }
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [cart, products]);

  const subtotalCL = useMemo(() => new Intl.NumberFormat("es-CL").format(subtotal), [subtotal]);

  return (
    <>
      <div
        aria-hidden
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 transition-opacity ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} z-40`}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-xl transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <h2 className="font-extrabold text-lg">Tu carrito</h2>
          <button onClick={closeCart} className="rounded-lg px-3 py-2 hover:bg-slate-100">✕</button>
        </div>

        <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-3">
          {cart.length === 0 && (
            <div className="rounded-xl border p-4 text-sm text-slate-600">Tu carrito está vacío.</div>
          )}

          {cart.map((item, index) => {
            const product = products[item.productModelId];
            if (!product) return null;

            let itemPrice = Number(product.basePrice);
            const selectedExtras = (product.extras || []).filter(e => item.extras.includes(e.id));
            selectedExtras.forEach(extra => {
              itemPrice += Number(extra.price) || 0;
            });

            const matchingImg = item.imageId
              ? product.imagenes?.find((img: Imagen) => img.id === item.imageId)
              : product.imagenes?.find((img: Imagen) => img.principal) ?? product.imagenes?.[0];
            const thumbUrl = matchingImg?.url || product.imageUrl || "/mochila1.png";

            // Colores: desde la imagen si la BD los trae, si no desde el nombre guardado
            const itemColors: ImagenColor[] = matchingImg?.colores?.length
              ? matchingImg.colores
              : (item.colorScheme?.colors ?? []).map(name => ({ nombre: name, hex: null }));

            return (
              <div key={index} className="flex gap-3 p-3 rounded-xl ring-1 ring-black/5 bg-white">
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={thumbUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-tight">{product.name}</p>

                  {/* Colores elegidos desde la galería */}
                  {itemColors.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                      {itemColors.map((color, i) => (
                        <ColorBadge key={i} nombre={color.nombre} hex={color.hex} />
                      ))}
                    </div>
                  )}

                  {selectedExtras.length > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Extras: {selectedExtras.map(e => e.name).join(", ")}
                    </p>
                  )}
                  <div className="mt-2 inline-flex items-center rounded-lg border">
                    <button 
                      className="px-3 py-1.5" 
                      onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)}
                    >
                      –
                    </button>
                    <input
                      className="w-12 text-center py-1.5 outline-none"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)}
                    />
                    <button 
                      className="px-3 py-1.5" 
                      onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${new Intl.NumberFormat("es-CL").format(itemPrice * item.quantity)}
                  </p>
                  <button 
                    onClick={() => removeItem(index, user)} 
                    className="text-xs text-slate-500 hover:text-slate-700 mt-1"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-16 border-t px-4 flex items-center justify-between bg-white">
          <div className="text-sm">
            <div className="flex gap-2">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold">${subtotalCL}</span>
            </div>
            <div className="text-xs text-slate-500">Envío e impuestos en checkout</div>
          </div>
          <Link 
            href="/cart" 
            className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90" 
            onClick={closeCart}
          >
            Ver carrito
          </Link>
        </div>
      </aside>
    </>
  );
}
