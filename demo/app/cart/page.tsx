// demo/app/cart/page.tsx
"use client";
import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";

export default function CartDemoPage() {
  const { cart, loadCart, addItem, updateItem, removeItem, rates, loadRates, setShipping, applyCoupon, getCheckout, pay, placeOrder, coupon, checkout, payment, order, error } = useCart();

  useEffect(() => { loadCart(); loadRates(); }, [loadCart, loadRates]);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-extrabold">Demo Carrito</h1>

      {error && <div className="p-3 rounded bg-red-100 text-red-800">{error}</div>}

      <section className="space-y-2">
        <h2 className="font-bold">Carrito</h2>
        <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(cart, null, 2)}</pre>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-colonta-primary text-white" onClick={() => addItem("roll-top", "RT-BLK", 1)}>Agregar RT-BLK</button>
          <button className="px-3 py-2 rounded border" onClick={() => updateItem("RT-BLK", 2)}>Cantidad RT-BLK = 2</button>
          <button className="px-3 py-2 rounded border" onClick={() => removeItem("RT-BLK")}>Quitar RT-BLK</button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Envío</h2>
        <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(rates, null, 2)}</pre>
        <div className="flex gap-2">
          {rates.map(r => (
            <button key={r.id} className="px-3 py-2 rounded border" onClick={() => setShipping(r.id)}>{r.label}</button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Cupón</h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border" onClick={() => applyCoupon("COLONTA10")}>Aplicar COLONTA10</button>
          <button className="px-3 py-2 rounded border" onClick={() => applyCoupon("NOPE")}>Aplicar NOPE</button>
        </div>
        <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(coupon, null, 2)}</pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Checkout</h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-colonta-primary text-white" onClick={() => getCheckout()}>Obtener resumen</button>
          <button className="px-3 py-2 rounded border" onClick={() => pay()}>Intento de pago</button>
          <button className="px-3 py-2 rounded border" onClick={() => placeOrder()}>Crear orden</button>
        </div>
        <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(checkout, null, 2)}</pre>
        <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(payment, null, 2)}</pre>
        <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(order, null, 2)}</pre>
      </section>
    </main>
  );
}
