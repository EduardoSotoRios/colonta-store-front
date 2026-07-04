// src/app/checkout/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCart as useCartStore } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getCartItemUnitPrice } from "@/lib/cartPricing";
import type { Address } from "@/lib/api";

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
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: "",
    number: "",
    comuna: "",
    region: "",
    postalCode: "",
  });

  // Leer error de Webpay en la URL (redirigido desde el backend tras pago fallido)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const webpayError = params.get("error");
    if (webpayError === "cancelled") setUiError("El pago fue cancelado en Webpay.");
    else if (webpayError === "rejected") setUiError("El pago fue rechazado. Verifica tus datos bancarios e intenta nuevamente.");
    else if (webpayError === "error") setUiError("Ocurrió un error en Webpay. Por favor intenta nuevamente.");
  }, []);

  // Hidratar usuario si no está hidratado
  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  // Prellenar dirección cuando el usuario esté disponible
  useEffect(() => {
    loadCart(user);
    // Prellenar dirección si el usuario tiene una guardada
    if (user?.direccion) {
      setDeliveryAddress({
        street: user.direccion.street || "",
        number: user.direccion.number || "",
        comuna: user.direccion.comuna || "",
        region: user.direccion.region || "",
        postalCode: user.direccion.postalCode || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + getCartItemUnitPrice(item, products) * item.quantity, 0);
  }, [cart, products]);

  // Calcular descuento
  const discount = useMemo(() => {
    console.log("[checkout] Calculating discount:", { coupon, subtotal });
    
    if (!coupon || !coupon.valid) {
      console.log("[checkout] No valid coupon");
      return 0;
    }
    
    if (coupon.value === undefined || coupon.value === null || coupon.value === 0) {
      console.log("[checkout] Coupon value is invalid:", coupon.value);
      return 0;
    }
    
    // Si es porcentaje: value es el porcentaje (ej: 50 = 50%)
    if (coupon.type === 'percent') {
      const calculated = subtotal * (coupon.value / 100);
      const rounded = Math.round(calculated);
      console.log("[checkout] Percent discount calculated:", { subtotal, percent: coupon.value, calculated, rounded });
      return rounded;
    }
    
    // Si no es porcentaje: value son pesos chilenos directamente (ej: 4000 = $4000)
    const rounded = Math.round(coupon.value);
    console.log("[checkout] Fixed discount:", rounded);
    return rounded;
  }, [coupon, subtotal]);

  // Calcular costo de envío basado en la región
  const shippingCost = useMemo(() => {
    if (!deliveryAddress.region) return 0;
    
    // Si es Región Metropolitana o contiene "Metropolitana", usar tarifa RM
    const isRM = deliveryAddress.region.toLowerCase().includes("metropolitana") || 
                 deliveryAddress.region.toLowerCase().includes("santiago");
    
    // Si hay comuna y es retiro en tienda (por ahora asumimos que no, pero se puede agregar)
    // Por defecto, si es RM: $2.990, si no: $4.900
    return isRM ? 2990 : 4900;
  }, [deliveryAddress.region]);

  // Calcular total: subtotal - descuento + envío
  const total = useMemo(() => {
    const calculatedTotal = subtotal - discount + shippingCost;
    return Math.max(0, calculatedTotal); // Asegurar que el total nunca sea negativo
  }, [subtotal, discount, shippingCost]);

  const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(n);
  const subtotalCL = useMemo(() => fmt(subtotal), [subtotal]);
  const discountCL = useMemo(() => fmt(discount), [discount]);
  const shippingCL = useMemo(() => fmt(shippingCost), [shippingCost]);
  const totalCL = useMemo(() => fmt(total), [total]);

  // Debug: mostrar información del cupón y cálculos
  useEffect(() => {
    console.log("[checkout] Cálculos:", {
      subtotal,
      discount,
      shippingCost,
      total,
      coupon: coupon ? {
        valid: coupon.valid,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      } : null,
    });
  }, [coupon, discount, subtotal, shippingCost, total]);

  async function goStep2() {
    if (!deliveryAddress.street || !deliveryAddress.number || !deliveryAddress.comuna || !deliveryAddress.region || !deliveryAddress.postalCode) {
      setUiError("Completa todos los campos de la dirección para continuar.");
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
      // Limpiar el input después de aplicar el cupón
      // El estado se actualizará automáticamente a través del hook
    } catch (e: any) {
      setUiError(e?.message ?? "No se pudo aplicar el cupón");
    } finally {
      setBusy(null);
    }
  }

  async function onPlaceOrder() {
    if (cart.length === 0) {
      setUiError("El carrito está vacío");
      return;
    }
    setBusy("order");
    setUiError(null);
    try {
      const order = await createOrder(deliveryAddress, coupon?.code, shippingCost);
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
              <a href="/login" className="text-colonta-primary underline">
                Iniciar sesión
              </a>
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
              <a href="/mochilas" className="text-colonta-primary underline">
                Volver a la tienda
              </a>
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
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 1 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>1. Dirección</li>
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 2 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>2. Resumen</li>
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 3 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>3. Confirmar</li>
              <li className={`px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${step >= 4 ? "bg-colonta-primary text-white" : "bg-slate-200"}`}>4. Pagar</li>
            </ol>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {uiError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{uiError}</div>}

            {/* STEP 1 - Dirección */}
            {step === 1 && (
              <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white">
                <h2 className="font-extrabold text-lg mb-4">Dirección de envío</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Calle *</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      placeholder="Av. Providencia"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold block mb-1">Número *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={deliveryAddress.number}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, number: e.target.value })}
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Comuna *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={deliveryAddress.comuna}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, comuna: e.target.value })}
                        placeholder="Providencia"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold block mb-1">Región *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={deliveryAddress.region}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, region: e.target.value })}
                        placeholder="Región Metropolitana"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Código postal *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={deliveryAddress.postalCode}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                        placeholder="7500000"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={goStep2} className="px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold">
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
                  {coupon && coupon.valid && (
                    <p className="text-xs text-green-600 font-semibold">
                      ✓ Cupón aplicado: {coupon.code} - {discount > 0 ? `$${discountCL} de descuento` : (coupon.type === 'percent' ? `${coupon.value || 0}%` : `$${fmt(coupon.value || 0)}`) + ' de descuento'}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4 space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Detalle de artículos</h3>
                    <ul className="space-y-2 text-sm">
                      {cart.map((item, idx) => {
                        if (item.customDesignImageUrl) {
                          const unitPrice = item.unitPrice ?? 0;
                          return (
                            <li key={idx} className="flex justify-between">
                              <span>🎨 Producto personalizado × {item.quantity}</span>
                              <span className="font-medium">${fmt(unitPrice * item.quantity)}</span>
                            </li>
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
                          <li key={idx} className="flex justify-between">
                            <span>
                              {product.name} × {item.quantity}
                              {selectedExtras.length > 0 && (
                                <span className="text-slate-500"> ({selectedExtras.map(e => e.name).join(", ")})</span>
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
                      <span className="font-medium">${subtotalCL}</span>
                    </div>
                    
                    {coupon && coupon.valid && discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento {coupon.code ? `(${coupon.code})` : ''}</span>
                        <span className="font-medium">-${discountCL}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Envío {deliveryAddress.region ? 
                          (deliveryAddress.region.toLowerCase().includes("metropolitana") || deliveryAddress.region.toLowerCase().includes("santiago") 
                            ? "(RM - 48h)" 
                            : "(Regiones - 3-5 días)") 
                          : ""}
                      </span>
                      <span className="font-medium">
                        {shippingCost > 0 ? `$${shippingCL}` : "Gratis"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between font-extrabold text-base border-t pt-2">
                      <span>Total</span>
                      <span>${totalCL}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
                  <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border font-semibold hover:bg-slate-50 order-2 sm:order-1">Volver</button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold order-1 sm:order-2"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 - Confirmar y pagar */}
            {step === 3 && (
              <div className="rounded-2xl ring-1 ring-black/5 p-5 bg-white space-y-4">
                <h2 className="font-extrabold text-lg">Confirmar pedido</h2>

                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-bold mb-2">Dirección de envío</h3>
                  <p className="text-sm">
                    {deliveryAddress.street} {deliveryAddress.number}<br />
                    {deliveryAddress.comuna}, {deliveryAddress.region}<br />
                    {deliveryAddress.postalCode}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-bold mb-3">Resumen de compra</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal productos</span>
                      <span className="font-medium">${subtotalCL}</span>
                    </div>
                    
                    {coupon && coupon.valid && discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento {coupon.code ? `(${coupon.code})` : ''}</span>
                        <span className="font-medium">-${discountCL}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Envío {deliveryAddress.region ? 
                          (deliveryAddress.region.toLowerCase().includes("metropolitana") || deliveryAddress.region.toLowerCase().includes("santiago") 
                            ? "(RM - 48h)" 
                            : "(Regiones - 3-5 días)") 
                          : ""}
                      </span>
                      <span className="font-medium">
                        {shippingCost > 0 ? `$${shippingCL}` : "Gratis"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between font-extrabold text-base border-t pt-2 mt-2">
                      <span>Total a pagar</span>
                      <span>${totalCL}</span>
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
                    <span className="font-medium">${subtotalCL}</span>
                  </div>
                  {coupon?.valid && discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({coupon.code})</span>
                      <span>-${discountCL}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Envío</span>
                    <span className="font-medium">{shippingCost > 0 ? `$${shippingCL}` : "Gratis"}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base border-t pt-2 mt-1">
                    <span>Total a pagar</span>
                    <span>${totalCL}</span>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-slate-200 p-5 text-center space-y-4">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Pago seguro con</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-[#E31B23] text-white font-black text-lg px-3 py-1 rounded">
                      Web
                    </div>
                    <div className="bg-[#1A1A2E] text-white font-black text-lg px-3 py-1 rounded">
                      pay
                    </div>
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
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Conectando con Webpay…
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pagar ${totalCL} con Webpay
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
                  <span className="font-medium">${subtotalCL}</span>
                </div>
                
                {coupon && coupon.valid && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento {coupon.code ? `(${coupon.code})` : ''}</span>
                    <span className="font-medium">-${discountCL}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Envío {deliveryAddress.region ? 
                      (deliveryAddress.region.toLowerCase().includes("metropolitana") || deliveryAddress.region.toLowerCase().includes("santiago") 
                        ? "(RM - 48h)" 
                        : "(Regiones - 3-5 días)") 
                      : ""}
                  </span>
                  <span className="font-medium">
                    {shippingCost > 0 ? `$${shippingCL}` : "Gratis"}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between font-extrabold text-lg border-t pt-3">
                <span>Total</span>
                <span>${totalCL}</span>
              </div>
              
              {!deliveryAddress.region && (
                <p className="text-xs text-slate-500">
                  Completa la dirección para calcular el envío
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
