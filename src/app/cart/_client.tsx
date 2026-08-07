"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { getCartItemUnitPrice } from "@/lib/cartPricing";
import { getCartOffers, type CartOffer } from "@/actions/cart-offers";
import Link from "next/link";
import type { ProductModel } from "@/lib/api";

const CLP = (n: number) => new Intl.NumberFormat("es-CL").format(n);

type Imagen = NonNullable<ProductModel["imagenes"]>[number];

function getCartItemImage(imagenes: Imagen[] | undefined, imageId: number | undefined): Imagen | undefined {
  if (!imagenes?.length) return undefined;
  if (imageId !== undefined) return imagenes.find((img) => img.id === imageId);
  return imagenes.find((img) => img.principal) ?? imagenes[0];
}

// ── Sección de ofertas (reutilizable en ambos estados) ───────────────────────
function OffersSection({
  offers,
  subtotal,
  user,
  addItem,
}: {
  offers: CartOffer[];
  subtotal: number;
  user: any;
  addItem: any;
}) {
  const [addingOffer, setAddingOffer] = useState<number | null>(null);

  if (!offers.length) return null;

  const unlocked = offers.filter(o => subtotal >= o.umbral_minimo);
  const locked   = offers.filter(o => subtotal < o.umbral_minimo);
  const next     = locked.sort((a, b) => a.umbral_minimo - b.umbral_minimo)[0] ?? null;

  if (!unlocked.length && !next) return null;

  async function handleAdd(offer: CartOffer) {
    setAddingOffer(offer.id);
    try {
      await addItem(
        { productModelId: offer.producto.id, productName: offer.producto.nombre, quantity: 1, extras: [], unitPrice: offer.precio_oferta },
        user
      );
    } finally {
      setAddingOffer(null);
    }
  }

  return (
    <div className="rounded-2xl ring-1 ring-black/5 p-4 bg-white space-y-3">
      <h3 className="font-extrabold text-base">🎁 Ofertas disponibles</h3>

      {unlocked.map(offer => (
        <div key={offer.id} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
          {offer.producto.imagen_url && (
            <img src={offer.producto.imagen_url} alt={offer.producto.nombre} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-green-200" />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">¡Desbloqueada!</span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{offer.producto.nombre}</p>
            <p className="text-xs text-slate-500">
              <span className="line-through">${CLP(offer.producto.precio_normal)}</span>
              {" → "}
              <span className="text-green-700 font-bold">${CLP(offer.precio_oferta)}</span>
            </p>
          </div>
          <button
            onClick={() => handleAdd(offer)}
            disabled={addingOffer === offer.id}
            className="shrink-0 text-sm font-semibold px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {addingOffer === offer.id ? "..." : `+$${CLP(offer.precio_oferta)}`}
          </button>
        </div>
      ))}

      {next && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-600">
            Agrega <span className="font-semibold text-slate-800">${CLP(next.umbral_minimo - subtotal)}</span> más y obtén{" "}
            <span className="font-semibold text-slate-800">{next.producto.nombre}</span> por{" "}
            <span className="font-semibold text-colonta-primary">${CLP(next.precio_oferta)}</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-colonta-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (subtotal / next.umbral_minimo) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Item de carrito (reutilizable) ───────────────────────────────────────────
function CartItemRow({
  item, index, product, products, user, updateItem, removeItem,
}: {
  item: any; index: number; product: ProductModel; products: any;
  user: any; updateItem: any; removeItem: any;
}) {
  const itemPrice    = getCartItemUnitPrice(item, products);
  const selectedExtras = (product.extras || []).filter((e: any) => item.extras.includes(e.id));
  const thumbUrl     = getCartItemImage(product.imagenes, item.imageId)?.url || product.imageUrl || "/mochila1.png";
  const isOfferPrice = item.unitPrice !== undefined && item.unitPrice < Number(product.basePrice);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl ring-1 ring-black/5 p-4 bg-white">
      <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
        <img src={thumbUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <p className="font-semibold truncate">{product.name}</p>
        {isOfferPrice && (
          <p className="text-xs mt-0.5">
            <span className="line-through text-slate-400">${CLP(Number(product.basePrice))}</span>
            <span className="ml-1 text-green-600 font-semibold">Oferta</span>
          </p>
        )}
        {item.colorScheme?.name && (
          <p className="text-xs text-slate-500">{item.colorScheme.name}</p>
        )}
        {selectedExtras.length > 0 && (
          <p className="text-xs text-slate-500 truncate">Extras: {selectedExtras.map((e: any) => e.name).join(", ")}</p>
        )}
        <div className="mt-2 inline-flex items-center rounded-xl border">
          <button onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)} className="px-3 py-2">–</button>
          <input
            className="w-12 text-center py-2 outline-none"
            value={item.quantity}
            onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)}
          />
          <button onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)} className="px-3 py-2">+</button>
        </div>
      </div>
      <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center">
        <p className="font-semibold">${CLP(itemPrice * item.quantity)}</p>
        <button onClick={() => removeItem(index, user)} className="text-sm text-slate-500 hover:text-slate-700 mt-1">Eliminar</button>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, error, products, addItem, loadCart, updateItem, removeItem, applyCoupon, coupon } = useCart();
  const [couponCode, setCouponCode]   = useState("");
  const [offers,     setOffers]       = useState<CartOffer[]>([]);

  useEffect(() => { loadCart(user); }, [user]); // eslint-disable-line
  useEffect(() => { getCartOffers().then(setOffers).catch(() => {}); }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + getCartItemUnitPrice(item, products) * item.quantity, 0),
    [cart, products]
  );

  const discount = useMemo(() => {
    if (!coupon?.valid || coupon.value == null) return 0;
    return coupon.type === 'percent'
      ? Math.round(subtotal * (coupon.value / 100))
      : Math.round(coupon.value);
  }, [coupon, subtotal]);

  const estimatedShipping = 3950;
  const total = Math.max(0, subtotal - discount + estimatedShipping);

  // ── Carrito vacío sin usuario ──────────────────────────────────────────────
  if (!user && cart.length === 0) {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Tu carrito</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border p-6 bg-white">
              <p className="font-semibold mb-2">Tu carrito está vacío</p>
              <Link href="/mochilas" className="text-colonta-primary underline">Ir a la tienda</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Items sin usuario (invitado) ───────────────────────────────────────────
  if (!user && cart.length > 0) {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/mochilas" className="text-white/80 hover:text-white">&larr; Seguir comprando</Link>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Tu carrito</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="font-semibold text-blue-900 mb-2">💡 Inicia sesión para continuar</p>
              <p className="text-sm text-blue-700 mb-3">
                Tienes {cart.length} {cart.length === 1 ? 'producto' : 'productos'} en tu carrito.
              </p>
              <Link href="/login" className="inline-block px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90">
                Iniciar sesión
              </Link>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
                {cart.map((item, index) => {
                  if (item.customDesignImageUrl) {
                    const unitPrice = item.unitPrice ?? 0;
                    return (
                      <div key={index} className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl ring-1 ring-black/5 p-4 bg-white">
                        <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          <img src={item.customDesignImageUrl} alt="Producto diseñado" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">🎨 Producto diseñado</p>
                          <div className="mt-2 inline-flex items-center rounded-xl border">
                            <button onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)} className="px-3 py-2">–</button>
                            <input className="w-12 text-center py-2 outline-none" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)} />
                            <button onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)} className="px-3 py-2">+</button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${CLP(unitPrice * item.quantity)}</p>
                          <button onClick={() => removeItem(index, user)} className="text-sm text-slate-500 hover:text-slate-700 mt-1">Eliminar</button>
                        </div>
                      </div>
                    );
                  }
                  const product = products[item.productModelId];
                  if (!product) return null;
                  return <CartItemRow key={index} item={item} index={index} product={product} products={products} user={user} updateItem={updateItem} removeItem={removeItem} />;
                })}

                <OffersSection offers={offers} subtotal={subtotal} user={user} addItem={addItem} />
              </div>

              <aside className="lg:col-span-4 order-1 lg:order-2">
                <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4 lg:sticky lg:top-4">
                  <h2 className="font-extrabold text-lg">Resumen de compra</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">${CLP(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Envío (estimado)</span><span className="font-medium">~${CLP(estimatedShipping)}</span></div>
                  </div>
                  <div className="flex justify-between font-extrabold text-lg border-t pt-3">
                    <span>Total estimado</span>
                    <span>${CLP(total)}</span>
                  </div>
                  <p className="text-xs text-slate-500">El envío se calcula al ingresar la dirección</p>
                  <Link href="/login" className="block text-center w-full px-5 py-3 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90">
                    Iniciar sesión para continuar
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Vista principal (usuario autenticado) ──────────────────────────────────
  return (
    <main className="min-h-screen">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/mochilas" className="text-white/80 hover:text-white">&larr; Seguir comprando</Link>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Tu carrito</h1>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
            {loading && <div className="rounded-xl border p-4">Cargando…</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {!loading && cart.length === 0 && (
              <div className="rounded-xl border p-6">
                <p className="font-semibold">Tu carrito está vacío</p>
                <Link href="/mochilas" className="text-colonta-primary underline">Ir a la tienda</Link>
              </div>
            )}

            {cart.map((item, index) => {
              if (item.customDesignImageUrl) {
                const unitPrice = item.unitPrice ?? 0;
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl ring-1 ring-black/5 p-4 bg-white">
                    <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={item.customDesignImageUrl} alt="Producto diseñado" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">🎨 Producto diseñado</p>
                      <div className="mt-2 inline-flex items-center rounded-xl border">
                        <button onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)} className="px-3 py-2">–</button>
                        <input className="w-12 text-center py-2 outline-none" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)} />
                        <button onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)} className="px-3 py-2">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${CLP(unitPrice * item.quantity)}</p>
                      <button onClick={() => removeItem(index, user)} className="text-sm text-slate-500 hover:text-slate-700 mt-1">Eliminar</button>
                    </div>
                  </div>
                );
              }
              const product = products[item.productModelId];
              if (!product) return null;
              return <CartItemRow key={index} item={item} index={index} product={product} products={products} user={user} updateItem={updateItem} removeItem={removeItem} />;
            })}

            <OffersSection offers={offers} subtotal={subtotal} user={user} addItem={addItem} />
          </div>

          <aside className="lg:col-span-4 order-1 lg:order-2">
            <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4 lg:sticky lg:top-4">
              <h2 className="font-extrabold text-lg">Resumen de compra</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal productos</span>
                  <span className="font-medium">${CLP(subtotal)}</span>
                </div>
                {coupon?.valid && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({coupon.code})</span>
                    <span className="font-medium">-${CLP(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Envío (estimado)</span>
                  <span className="font-medium">~${CLP(estimatedShipping)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Cupón</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded-xl px-3 py-2 text-sm"
                    placeholder="Ej: BIENVENIDO10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    onClick={() => couponCode.trim() && applyCoupon(couponCode.trim())}
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90"
                  >
                    Aplicar
                  </button>
                </div>
                {coupon && !coupon.valid && <p className="text-xs text-red-600">{coupon.message}</p>}
                {coupon?.valid && <p className="text-xs text-green-600">Cupón aplicado: {coupon.message}</p>}
              </div>

              <div className="flex justify-between font-extrabold text-lg border-t pt-3">
                <span>Total estimado</span>
                <span>${CLP(total)}</span>
              </div>
              <p className="text-xs text-slate-500">El envío se calcula al ingresar la dirección en checkout</p>

              <Link
                href="/checkout"
                className="block text-center w-full px-5 py-3 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90"
              >
                Ir a checkout
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
