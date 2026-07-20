"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { BlueExpressDelivery, Order } from "@/lib/api";
import Link from "next/link";

// ── Etapas y estilos ──────────────────────────────────────────────────────────
const ETAPAS: Array<{ key: Order["estado"]; label: string }> = [
  { key: "pendiente",   label: "Pago pendiente" },
  { key: "pagado",      label: "Pago confirmado" },
  { key: "manufactura", label: "En manufactura" },
  { key: "enviado",     label: "En camino" },
  { key: "entregado",   label: "Entregado" },
];

const ESTADO_BADGE: Record<Order["estado"], { cls: string; label: string }> = {
  pendiente:   { cls: "bg-amber-100 text-amber-700",   label: "Pago pendiente" },
  pagado:      { cls: "bg-sky-100 text-sky-700",       label: "Pago confirmado" },
  manufactura: { cls: "bg-purple-100 text-purple-700", label: "En manufactura" },
  enviado:     { cls: "bg-indigo-100 text-indigo-700", label: "En camino" },
  entregado:   { cls: "bg-green-100 text-green-700",   label: "Entregado" },
  cancelado:   { cls: "bg-red-100 text-red-700",       label: "Cancelado" },
};

const fmt = (n: number | string) => new Intl.NumberFormat("es-CL").format(Number(n));

// ── Modal zoom imagen ─────────────────────────────────────────────────────────
function ImageZoom({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-9 right-0 text-white/80 hover:text-white text-sm font-semibold"
        >
          Cerrar ✕
        </button>
        <img src={src} alt="Imagen del producto" className="w-full rounded-xl shadow-2xl" />
      </div>
    </div>
  );
}

// ── Barra de progreso ─────────────────────────────────────────────────────────
function OrderProgressBar({ estado }: { estado: Order["estado"] }) {
  if (estado === "cancelado") {
    return (
      <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600 font-medium">
        Pedido cancelado
      </div>
    );
  }
  const activeIdx = ETAPAS.findIndex((e) => e.key === estado);
  return (
    <div className="mt-4 px-1">
      <div className="flex items-center">
        {ETAPAS.map((etapa, idx) => {
          const done    = idx < activeIdx;
          const current = idx === activeIdx;
          const isLast  = idx === ETAPAS.length - 1;
          return (
            <div key={etapa.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                    done
                      ? "bg-green-500 border-green-500 text-white"
                      : current
                      ? "bg-colonta-primary border-colonta-primary text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {done ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`mt-1.5 text-[10px] font-medium text-center leading-tight w-16 ${
                  done ? "text-green-600" : current ? "text-colonta-primary font-semibold" : "text-slate-400"
                }`}>
                  {etapa.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${done ? "bg-green-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tarjeta de pedido ─────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const badge = ESTADO_BADGE[order.estado];
  const bep = (order.deliveryAddress as BlueExpressDelivery).type === "blue_express"
    ? (order.deliveryAddress as BlueExpressDelivery)
    : null;
  const addr = !bep ? (order.deliveryAddress as any) : null;

  return (
    <div className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden">
      {zoomSrc && <ImageZoom src={zoomSrc} onClose={() => setZoomSrc(null)} />}

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b bg-slate-50">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">
            {new Date(order.createdAt).toLocaleDateString("es-CL", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
          <p className="font-semibold text-slate-900">Orden #{order.id.slice(0, 8)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-extrabold text-lg">${fmt(order.total)}</p>
          <span className={`inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="px-5 pt-2 pb-3">
        <OrderProgressBar estado={order.estado} />
      </div>

      {/* Productos */}
      <ul className="px-5 pb-4 space-y-3 border-t pt-3">
        {order.items.map((item, idx) => {
          const imgSrc    = item.customDesignImageUrl || item.productImageUrl;
          const isCustom  = Boolean(item.customDesignImageUrl);
          const colorName = item.chosenColorScheme?.name;
          const colors    = item.chosenColorScheme?.colors ?? [];
          return (
            <li key={idx} className="flex items-start gap-4">
              {imgSrc ? (
                <button
                  type="button"
                  onClick={() => setZoomSrc(imgSrc)}
                  className="block w-20 h-20 flex-shrink-0 cursor-zoom-in"
                  title="Ver imagen ampliada"
                >
                  <img
                    src={imgSrc}
                    alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm hover:opacity-85 transition-opacity"
                  />
                </button>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-900">
                  {isCustom && (
                    <span className="mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 align-middle">
                      DISEÑO
                    </span>
                  )}
                  {item.productName}
                  {item.quantity > 1 && (
                    <span className="text-slate-400 font-normal ml-1">× {item.quantity}</span>
                  )}
                </p>
                {(colorName || colors.length > 0) && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {colors.map((c, i) => (
                      <span
                        key={i}
                        className="inline-block w-4 h-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: c.startsWith("#") ? c : undefined }}
                        title={c}
                      />
                    ))}
                    {colorName && <span className="text-xs text-slate-500">{colorName}</span>}
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-700 flex-shrink-0 pt-0.5">
                ${fmt(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Punto de retiro / dirección */}
      {bep ? (
        <div className="mx-5 mb-4 flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-800">Retiro en {bep.name}</p>
            <p className="text-xs text-blue-600 mt-0.5">{bep.address}, {bep.comuna} · {bep.hours}</p>
          </div>
        </div>
      ) : addr?.street ? (
        <p className="mx-5 mb-4 text-xs text-slate-500">
          {addr.street} {addr.number}, {addr.comuna}
        </p>
      ) : null}

      {/* Código de seguimiento Blue Express */}
      {order.trackingCode && (order.estado === "enviado" || order.estado === "entregado") ? (
        <div className="mx-5 mb-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 0m8 0H5m8 0l2 0m0 0h2a1 1 0 001-1v-5a1 1 0 00-.293-.707l-3-3A1 1 0 0016 6h-1v10z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-indigo-800">Tu pedido está en camino</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Código de seguimiento Blue Express:{" "}
              <span className="font-mono font-bold">{order.trackingCode}</span>
            </p>
            <a
              href={`https://www.blue.cl/tracking/?numero=${order.trackingCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline"
            >
              Rastrear en Blue Express →
            </a>
          </div>
        </div>
      ) : (
        <div className="mb-5" />
      )}
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function SeguimientoPage() {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    api.getOrders()
      .then((data) =>
        setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      )
      .catch((e) => setError(e?.message ?? "No se pudieron cargar los pedidos"))
      .finally(() => setLoading(false));
  }, [user, hydrated, router]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Mis Pedidos</h1>
          <p className="text-white/85 mt-1">Revisa el estado y el avance de cada uno de tus pedidos.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">

          {loading && (
            <div className="rounded-2xl ring-1 ring-black/5 bg-white p-8 text-center text-slate-500 text-sm">
              Cargando tus pedidos…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-2xl ring-1 ring-black/5 bg-white p-10 text-center">
              <p className="text-slate-500 mb-4">Todavía no tienes pedidos.</p>
              <Link
                href="/mochilas"
                className="inline-block px-5 py-2.5 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90"
              >
                Ir a la tienda
              </Link>
            </div>
          )}

          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>
    </main>
  );
}
