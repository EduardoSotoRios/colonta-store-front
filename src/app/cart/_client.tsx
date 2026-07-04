"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { getCartItemUnitPrice } from "@/lib/cartPricing";
import Link from "next/link";
import type { ProductModel } from "@/lib/api";

type Imagen = NonNullable<ProductModel["imagenes"]>[number];

function getCartItemImage(
  imagenes: Imagen[] | undefined,
  imageId: number | undefined
): Imagen | undefined {
  if (!imagenes?.length) return undefined;
  if (imageId !== undefined) return imagenes.find((img) => img.id === imageId);
  return imagenes.find((img) => img.principal) ?? imagenes[0];
}

export default function CartPage() {
  const { user } = useAuth();
  const {
    cart, loading, error, products,
    loadCart, updateItem, removeItem,
    applyCoupon, coupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    loadCart(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calcular subtotal desde los items del carrito
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + getCartItemUnitPrice(item, products) * item.quantity, 0);
  }, [cart, products]);

  const subtotalCL = useMemo(() => new Intl.NumberFormat("es-CL").format(subtotal), [subtotal]);
  
  // Calcular descuento si hay cupón
  const discount = useMemo(() => {
    if (!coupon || !coupon.valid) return 0;
    if (coupon.value === undefined || coupon.value === null) return 0;
    
    // Si es porcentaje: value es el porcentaje (ej: 50 = 50%)
    if (coupon.type === 'percent') {
      const calculated = subtotal * (coupon.value / 100);
      return Math.round(calculated);
    }
    
    // Si no es porcentaje: value son pesos chilenos directamente (ej: 4000 = $4000)
    return Math.round(coupon.value);
  }, [coupon, subtotal]);

  const discountCL = useMemo(() => new Intl.NumberFormat("es-CL").format(discount), [discount]);
  
  // Calcular costo de envío estimado (se calculará correctamente en checkout con la dirección)
  // Por ahora mostramos un estimado genérico
  const estimatedShipping = useMemo(() => {
    // Estimado promedio entre RM y regiones
    return 3950; // Promedio entre 2990 y 4900
  }, []);
  
  const estimatedShippingCL = useMemo(() => new Intl.NumberFormat("es-CL").format(estimatedShipping), [estimatedShipping]);
  
  // Calcular total: subtotal - descuento + envío
  const total = useMemo(() => {
    const calculatedTotal = subtotal - discount + estimatedShipping;
    return Math.max(0, calculatedTotal); // Asegurar que el total nunca sea negativo
  }, [subtotal, discount, estimatedShipping]);
  
  const totalCL = useMemo(() => new Intl.NumberFormat("es-CL").format(total), [total]);

  const handleApplyCoupon = async () => {
    if (couponCode.trim()) {
      await applyCoupon(couponCode.trim());
    }
  };

  // Si no hay usuario pero hay items en el carrito local, mostrar sugerencia de login
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
              <Link href="/mochilas" className="text-colonta-primary underline">
                Ir a la tienda
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Si no hay usuario pero hay items, mostrar carrito con sugerencia de login
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
                Tienes {cart.length} {cart.length === 1 ? 'producto' : 'productos'} en tu carrito. Inicia sesión para guardar tu carrito y continuar con tu compra.
              </p>
              <Link 
                href="/login" 
                className="inline-block px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90"
              >
                Iniciar sesión
              </Link>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
                {cart.map((item, index) => {
                  if (item.customDesignImageUrl) {
                    const unitPrice = item.unitPrice ?? 0;
                    return (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl ring-1 ring-black/5 p-4 bg-white">
                        <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          <img src={item.customDesignImageUrl} alt="Diseño personalizado" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                          <p className="font-semibold truncate">🎨 Producto personalizado</p>
                          <div className="mt-2 inline-flex items-center rounded-xl border">
                            <button
                              onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)}
                              className="px-3 py-2"
                            >
                              –
                            </button>
                            <input
                              className="w-12 text-center py-2 outline-none"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)}
                            />
                            <button
                              onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)}
                              className="px-3 py-2"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center sm:items-start">
                          <p className="font-semibold">
                            ${new Intl.NumberFormat("es-CL").format(unitPrice * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeItem(index, user)}
                            className="text-sm text-slate-500 hover:text-slate-700 mt-1"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const product = products[item.productModelId];
                  if (!product) return null;

                  let itemPrice = Number(product.basePrice);
                  const selectedExtras = (product.extras || []).filter(e => item.extras.includes(e.id));
                  selectedExtras.forEach(extra => {
                    itemPrice += Number(extra.price) || 0;
                  });

                  return (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl ring-1 ring-black/5 p-4 bg-white">
                      <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        <img
                          src={getCartItemImage(product.imagenes, item.imageId)?.url || product.imageUrl || "/mochila1.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="font-semibold truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.colorSchemeId ? `Esquema: ${item.colorSchemeId}` : "Color personalizado"}
                        </p>
                        {selectedExtras.length > 0 && (
                          <p className="text-xs text-slate-500 truncate">
                            Extras: {selectedExtras.map(e => e.name).join(", ")}
                          </p>
                        )}
                        <div className="mt-2 inline-flex items-center rounded-xl border">
                          <button 
                            onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)} 
                            className="px-3 py-2"
                          >
                            –
                          </button>
                          <input
                            className="w-12 text-center py-2 outline-none"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)}
                          />
                          <button 
                            onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)} 
                            className="px-3 py-2"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center sm:items-start">
                        <p className="font-semibold">
                          ${new Intl.NumberFormat("es-CL").format(itemPrice * item.quantity)}
                        </p>
                        <button 
                          onClick={() => removeItem(index, user)} 
                          className="text-sm text-slate-500 hover:text-slate-700 mt-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <aside className="lg:col-span-4 order-1 lg:order-2">
                <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4 lg:sticky lg:top-4">
                  <h2 className="font-extrabold text-lg">Resumen de compra</h2>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal productos</span>
                      <span className="font-medium">${subtotalCL}</span>
                    </div>

                    {coupon && coupon.valid && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento ({coupon.code})</span>
                        <span className="font-medium">-${discountCL}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-600">Envío (estimado)</span>
                      <span className="font-medium">~${estimatedShippingCL}</span>
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
                        disabled
                      />
                      <button 
                        disabled
                        className="px-4 py-2 rounded-xl font-semibold text-white bg-slate-400 cursor-not-allowed"
                      >
                        Aplicar
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Inicia sesión para aplicar cupones</p>
                  </div>

                  <div className="flex justify-between font-extrabold text-lg border-t pt-3">
                    <span>Total estimado</span>
                    <span>${totalCL}</span>
                  </div>
                  
                  <p className="text-xs text-slate-500">
                    El costo de envío se calculará al ingresar la dirección en checkout
                  </p>

                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block text-center w-full px-5 py-3 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90"
                    >
                      Iniciar sesión para continuar
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    );
  }

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
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl ring-1 ring-black/5 p-4 bg-white">
                    <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={item.customDesignImageUrl} alt="Diseño personalizado" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <p className="font-semibold truncate">🎨 Producto personalizado</p>
                      <div className="mt-2 inline-flex items-center rounded-xl border">
                        <button
                          onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)}
                          className="px-3 py-2"
                        >
                          –
                        </button>
                        <input
                          className="w-12 text-center py-2 outline-none"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)}
                        />
                        <button
                          onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)}
                          className="px-3 py-2"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center sm:items-start">
                      <p className="font-semibold">
                        ${new Intl.NumberFormat("es-CL").format(unitPrice * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(index, user)}
                        className="text-sm text-slate-500 hover:text-slate-700 mt-1"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              }

              const product = products[item.productModelId];
              if (!product) return null;

              let itemPrice = Number(product.basePrice);
              const selectedExtras = (product.extras || []).filter(e => item.extras.includes(e.id));
              selectedExtras.forEach(extra => {
                itemPrice += Number(extra.price) || 0;
              });

              return (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl ring-1 ring-black/5 p-4 bg-white">
                  <div className="w-full sm:w-20 h-48 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    <img
                      src={getCartItemImage(product.imagenes, item.imageId)?.url || product.imageUrl || "/mochila1.png"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.colorSchemeId ? `Esquema: ${item.colorSchemeId}` : "Color personalizado"}
                    </p>
                    {selectedExtras.length > 0 && (
                      <p className="text-xs text-slate-500 truncate">
                        Extras: {selectedExtras.map(e => e.name).join(", ")}
                      </p>
                    )}
                    <div className="mt-2 inline-flex items-center rounded-xl border">
                      <button
                        onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) }, user)}
                        className="px-3 py-2"
                      >
                        –
                      </button>
                      <input
                        className="w-12 text-center py-2 outline-none"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) }, user)}
                      />
                      <button
                        onClick={() => updateItem(index, { quantity: item.quantity + 1 }, user)}
                        className="px-3 py-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block items-center sm:items-start">
                    <p className="font-semibold">
                      ${new Intl.NumberFormat("es-CL").format(itemPrice * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(index, user)}
                      className="text-sm text-slate-500 hover:text-slate-700 mt-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="lg:col-span-4 order-1 lg:order-2">
            <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4 lg:sticky lg:top-4">
              <h2 className="font-extrabold text-lg">Resumen de compra</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal productos</span>
                  <span className="font-medium">${subtotalCL}</span>
                </div>

                {coupon && coupon.valid && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({coupon.code})</span>
                    <span className="font-medium">-${discountCL}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-600">Envío (estimado)</span>
                  <span className="font-medium">~${estimatedShippingCL}</span>
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
                    onClick={handleApplyCoupon} 
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90"
                  >
                    Aplicar
                  </button>
                </div>
                {coupon && !coupon.valid && (
                  <p className="text-xs text-red-600">{coupon.message}</p>
                )}
                {coupon && coupon.valid && (
                  <p className="text-xs text-green-600">Cupón aplicado: {coupon.message}</p>
                )}
              </div>

              <div className="flex justify-between font-extrabold text-lg border-t pt-3">
                <span>Total estimado</span>
                <span>${totalCL}</span>
              </div>
              
              <p className="text-xs text-slate-500">
                El costo de envío se calculará al ingresar la dirección en checkout
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  className="block text-center w-full px-5 py-3 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90"
                >
                  Ir a checkout
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
