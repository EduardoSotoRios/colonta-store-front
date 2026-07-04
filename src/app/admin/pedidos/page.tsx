"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, type Order, type BlueExpressDelivery } from "@/lib/api";
import Link from "next/link";

const ESTADO_STYLES: Record<Order["estado"], string> = {
  pendiente: "bg-amber-100 text-amber-700",
  pagado:    "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

const fmt     = (n: number) => new Intl.NumberFormat("es-CL").format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ── Modal imagen diseño personalizado ────────────────────────────────────────
function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-semibold"
        >
          Cerrar ✕
        </button>
        <img src={src} alt="Diseño personalizado" className="w-full rounded-xl shadow-2xl" />
      </div>
    </div>
  );
}

// ── Fila de item dentro de un pedido ─────────────────────────────────────────
function OrderItemRow({ item }: { item: Order["items"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const isCustom = Boolean(item.customDesignImageUrl);
  const imgSrc   = item.customDesignImageUrl || item.productImageUrl;
  const colors   = item.chosenColorScheme?.colors ?? [];
  const colorName = item.chosenColorScheme?.name;
  const extras   = item.chosenExtras ?? [];

  return (
    <>
      {expanded && item.customDesignImageUrl && (
        <ImageModal src={item.customDesignImageUrl} onClose={() => setExpanded(false)} />
      )}

      <li className="px-5 py-4 flex gap-4 items-start">
        {/* Imagen */}
        <div className="shrink-0">
          {imgSrc ? (
            <button
              type="button"
              onClick={() => isCustom && setExpanded(true)}
              className={`block relative ${isCustom ? "cursor-zoom-in" : "cursor-default"}`}
              title={isCustom ? "Ver diseño completo" : undefined}
            >
              <img
                src={imgSrc}
                alt={item.productName}
                className="w-20 h-20 rounded-xl object-cover border border-slate-200"
              />
              {isCustom && (
                <span className="absolute bottom-1 right-1 bg-purple-600 text-white text-[10px] px-1 rounded font-bold leading-tight">
                  DISEÑO
                </span>
              )}
            </button>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M3 3.75h18M21 3.75v14.25" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900 truncate">{item.productName}</p>
                {isCustom && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700 shrink-0">
                    Personalizado
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">Cantidad: {item.quantity}</p>
            </div>
            <p className="font-bold text-slate-800 shrink-0">${fmt(Number(item.unitPrice) * item.quantity)}</p>
          </div>

          {/* Colores */}
          {(colors.length > 0 || colorName) && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-slate-500">Color:</span>
              <div className="flex items-center gap-1">
                {colors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: c.startsWith("#") ? c : undefined }}
                    title={c}
                  />
                ))}
              </div>
              {colorName && <span className="text-xs text-slate-600">{colorName}</span>}
            </div>
          )}

          {/* Extras */}
          {extras.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Extras: {extras.map((e) => e.name).join(", ")}
            </p>
          )}

          {/* Enlace diseño personalizado */}
          {item.customDesignImageUrl && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium underline"
            >
              Ver diseño completo →
            </button>
          )}
        </div>
      </li>
    </>
  );
}

// ── Tarjeta de pedido ─────────────────────────────────────────────────────────
function OrderCard({
  pedido,
  onStatusChange,
}: {
  pedido: Order;
  onStatusChange: (id: string, estado: Order["estado"]) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const isBlueExpress =
    (pedido.deliveryAddress as BlueExpressDelivery).type === "blue_express";
  const bep = isBlueExpress ? (pedido.deliveryAddress as BlueExpressDelivery) : null;
  const addr = !isBlueExpress ? (pedido.deliveryAddress as any) : null;

  async function handleStatus(estado: Order["estado"]) {
    setBusy(true);
    await onStatusChange(pedido.id, estado).catch(() => {});
    setBusy(false);
  }

  return (
    <div className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden">
      {/* Cabecera */}
      <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b bg-slate-50">
        <div className="min-w-0">
          <p className="text-xs text-slate-400 mb-0.5">{fmtDate(pedido.createdAt)} · #{pedido.id.slice(0, 8)}</p>
          <p className="font-semibold text-slate-900 truncate">
            {pedido.user?.nombre ?? "Usuario desconocido"}
          </p>
          <p className="text-sm text-slate-500 truncate">{pedido.user?.email}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-lg">${fmt(Number(pedido.total))}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[pedido.estado]}`}>
            {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
          </span>
        </div>
      </div>

      {/* Productos */}
      <ul className="divide-y">
        {pedido.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </ul>

      {/* Punto de retiro / dirección */}
      <div className="px-5 py-3 border-t bg-slate-50 flex flex-wrap items-start justify-between gap-4">
        <div className="text-sm">
          {bep ? (
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#0056A2] shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-slate-700">Retiro Blue Express</p>
                <p className="text-slate-600">{bep.name}</p>
                <p className="text-slate-500 text-xs">{bep.address}, {bep.comuna} · {bep.hours}</p>
              </div>
            </div>
          ) : addr?.street ? (
            <div>
              <p className="font-semibold text-slate-700">Despacho a domicilio</p>
              <p className="text-slate-600">{addr.street} {addr.number}, {addr.comuna}</p>
              <p className="text-slate-500 text-xs">{addr.region}</p>
            </div>
          ) : null}
        </div>

        {/* Botones de estado */}
        <div className="flex items-center gap-2 flex-wrap">
          {pedido.estado !== "pagado" && (
            <button
              disabled={busy}
              onClick={() => handleStatus("pagado")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Marcar pagado
            </button>
          )}
          {pedido.estado !== "pendiente" && (
            <button
              disabled={busy}
              onClick={() => handleStatus("pendiente")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Marcar pendiente
            </button>
          )}
          {pedido.estado !== "cancelado" && (
            <button
              disabled={busy}
              onClick={() => handleStatus("cancelado")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PedidosAdminPage() {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [pedidos, setPedidos]   = useState<Order[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [filtro, setFiltro]     = useState<"todos" | Order["estado"]>("todos");

  useEffect(() => { loadPedidos(); }, []);

  async function loadPedidos() {
    try {
      setLoading(true);
      const data = await api.getAllOrdersAdmin();
      // Más recientes primero
      setPedidos(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, estado: Order["estado"]) {
    await api.updateOrderStatus(id, estado);
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado } : p));
  }

  const visible = filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);

  const counts = {
    todos:     pedidos.length,
    pendiente: pedidos.filter((p) => p.estado === "pendiente").length,
    pagado:    pedidos.filter((p) => p.estado === "pagado").length,
    cancelado: pedidos.filter((p) => p.estado === "cancelado").length,
  };

  if (loading || !user || user.rol !== "admin") {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Pedidos</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border p-6 bg-white"><p>Cargando...</p></div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al panel
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Pedidos</h1>
          <p className="text-white/85 mt-1">Todos los pedidos — imágenes, colores, diseños personalizados y punto de retiro</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {(["todos", "pendiente", "pagado", "cancelado"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtro === f
                    ? "bg-colonta-primary text-white"
                    : "bg-white ring-1 ring-black/10 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                <span className="opacity-70">({counts[f]})</span>
              </button>
            ))}
          </div>

          {visible.length === 0 && !error && (
            <div className="rounded-2xl ring-1 ring-black/5 bg-white p-6 text-slate-500">
              No hay pedidos para este filtro.
            </div>
          )}

          <div className="space-y-4">
            {visible.map((pedido) => (
              <OrderCard
                key={pedido.id}
                pedido={pedido}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
