// src/components/OrderSuccessClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import type { Order } from "@/lib/api";

export default function OrderSuccessClient() {
  const { getOrderById } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [paidViaWebpay, setPaidViaWebpay] = useState(false);

  useEffect(() => {
    // Intentar obtener orderId de la URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const amount = params.get("amount");

    // El backend redirige con ?amount=XXX cuando viene de Webpay
    if (amount) {
      setPaidAmount(Number(amount));
      setPaidViaWebpay(true);
    }
    
    if (orderId) {
      getOrderById(orderId).then((o) => {
        setOrder(o);
        setLoading(false);
      }).catch(() => {
        // Si falla, intentar desde localStorage
        try {
          const raw = localStorage.getItem("last_order");
          if (raw) setOrder(JSON.parse(raw));
        } catch {
          /* ignore */
        }
        setLoading(false);
      });
    } else {
      // Intentar desde localStorage
      try {
        const raw = localStorage.getItem("last_order");
        if (raw) setOrder(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
  }, [getOrderById]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-slate-600">Cargando orden...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-extrabold">No hay orden para mostrar</h1>
        <p className="mt-2 text-slate-600">
          Vuelve a la tienda para continuar comprando.
        </p>
        <Link
          href="/mochilas"
          className="inline-flex mt-6 px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold"
        >
          Ir a Mochilas
        </Link>
      </div>
    );
  }

  const totalCL = new Intl.NumberFormat("es-CL").format(Number(order.total));
  
  // Calcular subtotal desde items
  const subtotal = order.items.reduce((sum, item) => {
    return sum + (Number(item.unitPrice) * item.quantity);
  }, 0);
  const subtotalCL = new Intl.NumberFormat("es-CL").format(subtotal);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
        {paidViaWebpay ? (
          <div className="flex items-start gap-3 mb-5 rounded-xl bg-green-50 border border-green-200 p-4">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-green-800">Pago aprobado por Webpay</p>
              {paidAmount && (
                <p className="text-sm text-green-700 mt-0.5">
                  Monto cobrado: <span className="font-semibold">${new Intl.NumberFormat("es-CL").format(paidAmount)}</span>
                </p>
              )}
            </div>
          </div>
        ) : null}
        <h1 className="text-2xl font-extrabold">¡Gracias por tu compra!</h1>
        <p className="mt-1 text-slate-600">
          Orden <span className="font-semibold">#{order.id.slice(0, 8)}</span> —{" "}
          {new Date(order.createdAt).toLocaleString("es-CL")}
        </p>

        <h2 className="mt-6 font-bold">Resumen</h2>
        <ul className="mt-2 space-y-2">
          {order.items.map((item, idx) => {
            const colorSchemeName = item.chosenColorScheme.name || "Personalizado";
            const extrasNames = item.chosenExtras.map(e => e.name).join(", ");
            return (
              <li key={idx} className="flex items-center justify-between text-sm">
                <span>
                  {item.productName || "Producto"} × {item.quantity}
                  {colorSchemeName && (
                    <span className="text-slate-500"> — {colorSchemeName}</span>
                  )}
                  {extrasNames && (
                    <span className="text-slate-500"> — Extras: {extrasNames}</span>
                  )}
                </span>
                <span>${new Intl.NumberFormat("es-CL").format(Number(item.unitPrice) * item.quantity)}</span>
              </li>
            );
          })}
        </ul>

        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotalCL}</dd></div>
          <div className="flex justify-between font-extrabold border-t pt-2 mt-2">
            <dt>Total</dt><dd>${totalCL}</dd>
          </div>
        </dl>

        <h2 className="mt-6 font-bold">Dirección de envío</h2>
        <p className="text-sm text-slate-700">
          {order.deliveryAddress.street} {order.deliveryAddress.number}<br />
          {order.deliveryAddress.comuna}, {order.deliveryAddress.region}<br />
          {order.deliveryAddress.postalCode}
        </p>

        <div className="mt-8 flex gap-3">
          <Link href="/mochilas" className="px-5 py-3 rounded-xl border font-semibold hover:bg-slate-50">
            Seguir comprando
          </Link>
          <button
            onClick={() => {
              try { localStorage.removeItem("last_order"); } catch {}
              window.location.href = "/mochilas";
            }}
            className="px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
