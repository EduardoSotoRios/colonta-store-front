// src/components/CartSidebar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCartUI } from "@/hooks/useCartUI";
import { getColorEmoji } from "@/lib/colores-map";
import { getCartItemUnitPrice } from "@/lib/cartPricing";
import { getCartOffers, type CartOffer } from "@/actions/cart-offers";
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

const CLP = (n: number) => new Intl.NumberFormat("es-CL").format(n);

export default function CartSidebar() {
  const { user } = useAuth();
  const { cart, products, updateItem, removeItem, addItem } = useCart();
  const { isCartOpen, closeCart } = useCartUI();

  const [offers, setOffers] = useState<CartOffer[]>([]);
  const [addingOffer, setAddingOffer] = useState<number | null>(null);

  // Cargar ofertas una vez al montar
  useEffect(() => {
    getCartOffers().then(setOffers).catch(() => {});
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + getCartItemUnitPrice(item, products) * item.quantity, 0),
    [cart, products]
  );

  // Ofertas desbloqueadas vs. la próxima bloqueada
  const { unlockedOffers, nextOffer } = useMemo(() => {
    const unlocked = offers.filter(o => subtotal >= o.umbral_minimo);
    const locked   = offers.filter(o => subtotal < o.umbral_minimo);
    // Siguiente oferta: la de menor umbral entre las bloqueadas
    const next = locked.sort((a, b) => a.umbral_minimo - b.umbral_minimo)[0] ?? null;
    return { unlockedOffers: unlocked, nextOffer: next };
  }, [offers, subtotal]);

  async function handleAddOffer(offer: CartOffer) {
    setAddingOffer(offer.id);
    try {
      await addItem(
        {
          productModelId: offer.producto.id,
          productName: offer.producto.nombre,
          quantity: 1,
          extras: [],
          unitPrice: offer.precio_oferta,
        },
        user
      );
    } finally {
      setAddingOffer(null);
    }
  }

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

          {/* Items del carrito */}
          {cart.map((item, index) => {
            if (item.customDesignImageUrl) {
              const unitPrice = item.unitPrice ?? 0;
              return (
                <div key={index} className="flex gap-3 p-3 rounded-xl ring-1 ring-black/5 bg-white">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img src={item.customDesignImageUrl} alt="Producto diseñado" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-tight">🎨 Producto diseñado</p>
                    <div className="mt-2 inline-flex items-center rounded-lg border">
                      <button className="px-3 py-1.5" onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)}>–</button>
                      <input className="w-12 text-center py-1.5 outline-none" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)} />
                      <button className="px-3 py-1.5" onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)}>+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${CLP(unitPrice * item.quantity)}</p>
                    <button onClick={() => removeItem(index, user)} className="text-xs text-slate-500 hover:text-slate-700 mt-1">Eliminar</button>
                  </div>
                </div>
              );
            }

            const product = products[item.productModelId];
            if (!product) return null;

            const itemPrice = getCartItemUnitPrice(item, products);
            const selectedExtras = (product.extras || []).filter(e => item.extras.includes(e.id));

            const matchingImg = item.imageId
              ? product.imagenes?.find((img: Imagen) => img.id === item.imageId)
              : product.imagenes?.find((img: Imagen) => img.principal) ?? product.imagenes?.[0];
            const thumbUrl = matchingImg?.url || product.imageUrl || "/mochila1.png";

            const itemColors: ImagenColor[] = matchingImg?.colores?.length
              ? matchingImg.colores
              : (item.colorScheme?.colors ?? []).map(name => ({ nombre: name, hex: null }));

            return (
              <div key={index} className="flex gap-3 p-3 rounded-xl ring-1 ring-black/5 bg-white">
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img src={thumbUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-tight">{product.name}</p>
                  {/* Precio de oferta vs. precio normal */}
                  {item.unitPrice !== undefined && item.unitPrice < Number(product.basePrice) && (
                    <p className="text-xs mt-0.5">
                      <span className="line-through text-slate-400">${CLP(Number(product.basePrice))}</span>
                      <span className="ml-1 text-green-600 font-semibold">Oferta</span>
                    </p>
                  )}
                  {itemColors.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                      {itemColors.map((color, i) => <ColorBadge key={i} nombre={color.nombre} hex={color.hex} />)}
                    </div>
                  )}
                  {selectedExtras.length > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">Extras: {selectedExtras.map(e => e.name).join(", ")}</p>
                  )}
                  <div className="mt-2 inline-flex items-center rounded-lg border">
                    <button className="px-3 py-1.5" onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)}>–</button>
                    <input className="w-12 text-center py-1.5 outline-none" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)} />
                    <button className="px-3 py-1.5" onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)}>+</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${CLP(itemPrice * item.quantity)}</p>
                  <button onClick={() => removeItem(index, user)} className="text-xs text-slate-500 hover:text-slate-700 mt-1">Eliminar</button>
                </div>
              </div>
            );
          })}

          {/* Sección de ofertas (solo si hay items en el carrito) */}
          {cart.length > 0 && offers.length > 0 && (
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">🎁 Ofertas</p>

              {/* Ofertas desbloqueadas */}
              {unlockedOffers.map(offer => (
                <div key={offer.id} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                  {offer.producto.imagen_url && (
                    <img src={offer.producto.imagen_url} alt={offer.producto.nombre} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-green-200" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">¡Desbloqueada!</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{offer.producto.nombre}</p>
                    <p className="text-xs text-slate-500">
                      <span className="line-through">${CLP(offer.producto.precio_normal)}</span>
                      {" → "}
                      <span className="text-green-700 font-bold">${CLP(offer.precio_oferta)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddOffer(offer)}
                    disabled={addingOffer === offer.id}
                    className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    {addingOffer === offer.id ? "..." : `+$${CLP(offer.precio_oferta)}`}
                  </button>
                </div>
              ))}

              {/* Próxima oferta bloqueada */}
              {nextOffer && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {nextOffer.producto.imagen_url && (
                    <img src={nextOffer.producto.imagen_url} alt={nextOffer.producto.nombre} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 opacity-60" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 leading-snug">
                      Agrega{" "}
                      <span className="font-semibold text-slate-700">${CLP(nextOffer.umbral_minimo - subtotal)}</span>
                      {" más y obtén "}
                      <span className="font-semibold text-slate-700">{nextOffer.producto.nombre}</span>
                      {" por "}
                      <span className="font-semibold text-colonta-primary">${CLP(nextOffer.precio_oferta)}</span>
                    </p>
                    {/* Barra de progreso */}
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-colonta-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, (subtotal / nextOffer.umbral_minimo) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-16 border-t px-4 flex items-center justify-between bg-white">
          <div className="text-sm">
            <div className="flex gap-2">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold">${CLP(subtotal)}</span>
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
