// src/components/OrderSuccessClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import type { Order, BlueExpressDelivery } from "@/lib/api";

function ItemImage({ item }: { item: Order["items"][number] }) {
  const src = item.customDesignImageUrl || item.productImageUrl;
  if (!src) return null;
  return (
    <img
      src={src}
      alt={item.productName}
      className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
    />
  );
}

function ColorDots({ colors }: { colors: string[] }) {
  if (!colors?.length) return null;
  return (
    <span className="inline-flex gap-1 ml-1">
      {colors.map((c, i) => (
        <span
          key={i}
          className="inline-block w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
          style={{ backgroundColor: c.startsWith('#') ? c : undefined }}
          title={c}
        />
      ))}
    </span>
  );
}

function DeliveryInfo({ delivery }: { delivery: Order["deliveryAddress"] }) {
  if ((delivery as BlueExpressDelivery).type === "blue_express") {
    const p = delivery as BlueExpressDelivery;
    return (
      <div>
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#0056A2]">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
            </svg>
          </span>
          Punto de retiro Blue Express
        </h2>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm">
          <p className="font-semibold text-blue-900">{p.name}</p>
          <p className="text-blue-700 mt-0.5">{p.address}, {p.comuna}</p>
          {p.city && p.city !== p.comuna && <p className="text-blue-600 text-xs">{p.city}</p>}
          <p className="text-blue-500 text-xs mt-1">{p.hours}</p>
        </div>
      </div>
    );
  }
  const a = delivery as any;
  return (
    <div>
      <h2 className="font-bold mb-2">Dirección de envío</h2>
      <p className="text-sm text-slate-700">
        {a.street} {a.number}<br />
        {a.comuna}, {a.region}<br />
        {a.postalCode}
      </p>
    </div>
  );
}

export default function OrderSuccessClient() {
  const { getOrderById, clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [paidViaWebpay, setPaidViaWebpay] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const amount = params.get("amount");

    if (amount) { setPaidAmount(Number(amount)); setPaidViaWebpay(true); }

    if (orderId) {
      getOrderById(orderId)
        .then((o) => {
          setOrder(o);
          setLoading(false);
          clearCart();
        })
        .catch(() => { setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [getOrderById, clearCart]);

  if (loading) {
    return <div className="max-w-2xl mx-auto text-center"><p className="text-slate-600">Cargando orden...</p></div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-extrabold">No hay orden para mostrar</h1>
        <p className="mt-2 text-slate-600">Vuelve a la tienda para continuar comprando.</p>
        <Link href="/mochilas" className="inline-flex mt-6 px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold">
          Ir a Mochilas
        </Link>
      </div>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(n);
  const subtotal = order.items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-6">

        {paidViaWebpay && (
          <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-green-800">Pago aprobado por Webpay</p>
              {paidAmount && (
                <p className="text-sm text-green-700 mt-0.5">
                  Monto cobrado: <span className="font-semibold">${fmt(paidAmount)}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-extrabold">¡Gracias por tu compra!</h1>
          <p className="mt-1 text-slate-600">
            Orden <span className="font-semibold">#{order.id.slice(0, 8)}</span> —{" "}
            {new Date(order.createdAt).toLocaleString("es-CL")}
          </p>
        </div>

        {/* Productos */}
        <div>
          <h2 className="font-bold mb-3">Productos</h2>
          <ul className="space-y-3">
            {order.items.map((item, idx) => {
              const isCustom = Boolean(item.customDesignImageUrl);
              const colorName = item.chosenColorScheme?.name;
              const colors = item.chosenColorScheme?.colors ?? [];
              const extrasNames = item.chosenExtras?.map(e => e.name).join(", ");
              return (
                <li key={idx} className="flex items-center gap-3 rounded-xl border p-3 bg-slate-50">
                  <ItemImage item={item} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {isCustom ? "🎨 " : ""}{item.productName || "Producto"}
                      {item.quantity > 1 && <span className="text-slate-500 font-normal"> × {item.quantity}</span>}
                    </p>
                    {(colorName || colors.length > 0) && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-slate-500">{colorName || "Color:"}</span>
                        <ColorDots colors={colors} />
                      </div>
                    )}
                    {extrasNames && (
                      <p className="text-xs text-slate-500 mt-0.5">Extras: {extrasNames}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold flex-shrink-0">
                    ${fmt(Number(item.unitPrice) * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Totales */}
        <dl className="space-y-1 text-sm border-t pt-4">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal productos</dt>
            <dd>${fmt(subtotal)}</dd>
          </div>
          {Number((order as any).shippingCost) > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-600">Envío</dt>
              <dd>${fmt(Number((order as any).shippingCost))}</dd>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-base border-t pt-2 mt-1">
            <dt>Total</dt>
            <dd>${fmt(Number(order.total))}</dd>
          </div>
        </dl>

        {/* Punto de retiro / Dirección */}
        <DeliveryInfo delivery={order.deliveryAddress} />

        <div className="flex gap-3 pt-2">
          <Link href="/mochilas" className="px-5 py-3 rounded-xl border font-semibold hover:bg-slate-50">
            Seguir comprando
          </Link>
          <Link href="/seguimiento" className="px-5 py-3 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
