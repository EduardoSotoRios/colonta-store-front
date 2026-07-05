// src/app/checkout/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCart as useCartStore } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getCartItemUnitPrice } from "@/lib/cartPricing";
import BlueExpressSelector from "@/components/BlueExpressSelector";
import type { BlueExpressPoint } from "@/lib/blue-express-points";

type Step = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, hydrate, hydrated } = useAuth();
  const {
    cart,
    loading,
    error,
    products,
    coupon,
    loadCart,
    applyCoupon,
    createOrder,
  } = useCart();

  const [step, setStep] = useState<Step>(1);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "coupon" | "order" | "pay">(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<BlueExpressPoint | null>(null);

  // Leer error de Webpay en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const webpayError = params.get("error");
    if (webpayError === "cancelled") setUiError("El pago fue cancelado en Webpay.");
    else if (webpayError === "rejected") setUiError("El pago fue rechazado. Verifica tus datos bancarios e intenta nuevamente.");
    else if (webpayError === "error") setUiError("Ocurrió un error en Webpay. Por favor intenta nuevamente.");
  }, []);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    loadCart(user);
  }, [user]);

  // Calcular subtotal
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + getCartItemUnitPrice(item, products) * item.quantity, 0),
    [cart, products]
  );

  // Calcular descuento
  const discount = useMemo(() => {
    if (!coupon?.valid || !coupon.value) return 0;
    if (coupon.type === "percent") return Math.round(subtotal * (coupon.value / 100));
    return Math.round(coupon.value);
  }, [coupon, subtotal]);

  // Costo de envío según región del punto Blue Express
  const shippingCost = useMemo(() => {
    if (!selectedPoint) return 0;
    const isRM = selectedPoint.region.toLowerCase().includes("metropolitana");
    return isRM ? 2990 : 4900;
  }, [selectedPoint]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount + shippingCost),
    [subtotal, discount, shippingCost]
  );

  const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(n);

  function goStep2() {
    if (!selectedPoint) {
      setUiError("Selecciona un punto de retiro Blue Express para continuar.");
      return;
    }
    setUiError(null);
    setStep(2);
  }

  async function onApplyCoupon() {
    if (!couponCode.trim()) return;
    setBusy("coupon");
    setUiError(null);
    try {
      await applyCoupon(couponCode.trim());
    } catch (e: any) {
      setUiError(e?.message ?? "No se pudo aplicar el cupón");
    } finally {
      setBusy(null);
    }
  }

  async function onPlaceOrder() {
    if (cart.length === 0) { setUiError("El carrito está vacío"); return; }
    if (!selectedPoint) { setUiError("Selecciona un punto de retiro"); return; }
    setBusy("order");
    setUiError(null);
    try {
      const deliveryAddress = {
        type: "blue_express" as const,
        pointId: selectedPoint.id,
        name: selectedPoint.name,
        address: selectedPoint.address,
        comuna: selectedPoint.comuna,
        city: selectedPoint.city,
        region: selectedPoint.region,
        hours: selectedPoint.hours,
      };
      const order = await createOrder(deliveryAddress as any, coupon?.code, shippingCost);
      setPendingOrderId(order.id);
      setStep(4);
    } catch (e: any) {
      setUiError(e?.message ?? "No se pudo crear la orden");
    } finally {
      setBusy(null);
    }
  }

  async function onPayWithWebpay() {
    if (!pendingOrderId) return;
    setBusy("pay");
    setUiError(null);
    try {
      const { token, url } = await api.startWebpay(pendingOrderId);
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "token_ws";
      input.value = token;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch (e: any) {
      setUiError(e?.message ?? "No se pudo iniciar el pago. Intenta nuevamente.");
      setBusy(null);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Checkout</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border p-6 bg-white">
              <p className="font-semibold mb-2">Debes iniciar sesión para continuar</p>
              <a href="/login" className="text-colonta-primary underline">Iniciar sesión</a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (loading && cart.length === 0) {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Checkout</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Cargando…</div>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Checkout</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border p-6 bg-white">
              <p className="font-semibold">Tu carrito está vacío</p>
              <a href="/mochilas" className="text-colonta-primary underline">Volver a la tienda</a>
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
          <a href="/cart" className="text-white/80 hover:text-white">&larr; Volver al carrito</a>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Checkout</h1>
          <p className="text-white/85">Completa tus datos para finalizar tu compra.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          {/* Pasos */}
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            <ol className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto pb-2">
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 1 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>1. Punto retiro</li>
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 2 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>2. Resumen</li>
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 3 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>3. Confirmar</li>
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 4 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>4. Pagar</li>
            </ol>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {uiError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{uiError}</div>}

            {/* STEP 1 - Punto Blue Express */}
            {step === 1 && (
              <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#0056A2] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg leading-tight">Punto de retiro Blue Express</h2>
                    <p className="text-xs text-slate-500">Elige la sucursal donde retirarás tu pedido</p>
                  </div>
                </div>

                <BlueExpressSelector
                  selected={selectedPoint}
                  onChange={setSelectedPoint}
                />

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={goStep2}
                    disabled={!selectedPoint}
                    className="px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 - Resumen y cupón */}
            {step === 2 && (
              <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4">
                <h2 className="font-extrabold text-lg">Resumen y cupón</h2>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Cupón de descuento</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border rounded-xl px-3 py-2 text-sm"
                      placeholder="Ej: BIENVENIDO10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={busy === "coupon"}
                    />
                    <button
                      onClick={onApplyCoupon}
                      disabled={busy === "coupon" || !couponCode.trim()}
                      className="px-4 py-2 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 disabled:opacity-60"
                    >
                      {busy === "coupon" ? "Aplicando…" : "Aplicar"}
                    </button>
                  </div>
                  {coupon && !coupon.valid && (
                    <p className="text-xs text-red-600">{coupon.message || "Cupón inválido"}</p>
                  )}
                  {coupon?.valid && (
                    <p className="text-xs text-green-600 font-semibold">
                      ✓ Cupón aplicado: {coupon.code} — {discount > 0 ? `$${fmt(discount)} de descuento` : `${coupon.value}% de descuento`}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4 space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Detalle de artículos</h3>
                    <ul className="space-y-2 text-sm">
                      {cart.map((item, idx) => {
                        if (item.customDesignImageUrl) {
                          return (
                            <li key={idx} className="flex justify-between">
                              <span>🎨 Producto diseñado × {item.quantity}</span>
                              <span className="font-medium">${fmt((item.unitPrice ?? 0) * item.quantity)}</span>
                            </li>
                          );
                        }
                        const product = products[item.productModelId];
                        if (!product) return null;
                        let itemPrice = Number(product.basePrice);
                        const selectedExtras = (product.extras || []).filter((e) => item.extras.includes(e.id));
                        selectedExtras.forEach((extra) => { itemPrice += Number(extra.price) || 0; });
                        return (
                          <li key={idx} className="flex justify-between">
                            <span>
                              {product.name} × {item.quantity}
                              {item.colorScheme?.name && (
                                <span className="text-slate-500"> — {item.colorScheme.name}</span>
                              )}
                              {selectedExtras.length > 0 && (
                                <span className="text-slate-500"> ({selectedExtras.map((e) => e.name).join(", ")})</span>
                              )}
                            </span>
                            <span className="font-medium">${fmt(itemPrice * item.quantity)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal productos</span>
                      <span className="font-medium">${fmt(subtotal)}</span>
                    </div>
                    {coupon?.valid && discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento ({coupon.code})</span>
                        <span className="font-medium">-${fmt(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Envío Blue Express{" "}
                        {selectedPoint?.region.includes("Metropolitana") ? "(RM - 48h)" : "(Regiones - 3-5 días)"}
                      </span>
                      <span className="font-medium">${fmt(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-base border-t pt-2">
                      <span>Total</span>
                      <span>${fmt(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
                  <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border font-semibold hover:bg-slate-50 order-2 sm:order-1">Volver</button>
                  <button onClick={() => setStep(3)} className="px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold order-1 sm:order-2">Continuar</button>
                </div>
              </div>
            )}

            {/* STEP 3 - Confirmar */}
            {step === 3 && (
              <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4">
                <h2 className="font-extrabold text-lg">Confirmar pedido</h2>

                {/* Punto seleccionado */}
                {selectedPoint && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded bg-[#0056A2]" />
                      Punto de retiro Blue Express
                    </h3>
                    <p className="text-sm font-semibold">{selectedPoint.name}</p>
                    <p className="text-sm text-slate-600">
                      {selectedPoint.address}, {selectedPoint.comuna}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedPoint.hours}</p>
                  </div>
                )}

                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-bold mb-3">Resumen de compra</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal productos</span>
                      <span className="font-medium">${fmt(subtotal)}</span>
                    </div>
                    {coupon?.valid && discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento ({coupon.code})</span>
                        <span className="font-medium">-${fmt(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Envío Blue Express{" "}
                        {selectedPoint?.region.includes("Metropolitana") ? "(RM - 48h)" : "(Regiones - 3-5 días)"}
                      </span>
                      <span className="font-medium">${fmt(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-base border-t pt-2 mt-2">
                      <span>Total a pagar</span>
                      <span>${fmt(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
                  <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border font-semibold hover:bg-slate-50 order-2 sm:order-1">Volver</button>
                  <button
                    onClick={onPlaceOrder}
                    disabled={busy === "order"}
                    className="px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold disabled:opacity-60 order-1 sm:order-2"
                  >
                    {busy === "order" ? "Procesando…" : "Confirmar pedido"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 - Pagar con Webpay */}
            {step === 4 && (
              <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-extrabold text-xl">¡Pedido creado!</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Orden #{pendingOrderId?.slice(0, 8)} — solo falta el pago
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">${fmt(subtotal)}</span>
                  </div>
                  {coupon?.valid && discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({coupon.code})</span>
                      <span>-${fmt(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Envío Blue Express</span>
                    <span className="font-medium">${fmt(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base border-t pt-2 mt-1">
                    <span>Total a pagar</span>
                    <span>${fmt(total)}</span>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-slate-200 p-5 text-center space-y-4">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Pago seguro con</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-[#E31B23] text-white font-black text-lg px-3 py-1 rounded">Web</div>
                    <div className="bg-[#1A1A2E] text-white font-black text-lg px-3 py-1 rounded">pay</div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Serás redirigido al portal seguro de Transbank para completar tu pago.
                  </p>
                  <button
                    onClick={onPayWithWebpay}
                    disabled={busy === "pay"}
                    className="w-full py-4 rounded-xl bg-[#E31B23] hover:bg-[#c01018] text-white font-extrabold text-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {busy === "pay" ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Conectando con Webpay…
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pagar ${fmt(total)} con Webpay
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-slate-400">
                  Tu pedido quedará reservado. Si cierras esta página puedes retomar el pago desde tu historial de órdenes.
                </p>
              </div>
            )}
          </div>

          {/* Resumen lateral */}
          <aside className="lg:col-span-4 order-1 lg:order-2">
            <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4 lg:sticky lg:top-4">
              <h3 className="font-extrabold text-lg">Resumen de compra</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal productos</span>
                  <span className="font-medium">${fmt(subtotal)}</span>
                </div>
                {coupon?.valid && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({coupon.code})</span>
                    <span className="font-medium">-${fmt(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Envío Blue Express{" "}
                    {selectedPoint
                      ? selectedPoint.region.includes("Metropolitana")
                        ? "(RM)"
                        : "(Regiones)"
                      : ""}
                  </span>
                  <span className="font-medium">
                    {selectedPoint ? `$${fmt(shippingCost)}` : "—"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-lg border-t pt-3">
                <span>Total</span>
                <span>${fmt(total)}</span>
              </div>

              {!selectedPoint && (
                <p className="text-xs text-slate-500">
                  Selecciona un punto Blue Express para ver el costo de envío
                </p>
              )}

              {selectedPoint && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-700">{selectedPoint.name}</p>
                  <p className="text-slate-500">{selectedPoint.address}, {selectedPoint.comuna}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
