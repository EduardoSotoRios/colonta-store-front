"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, type Order, type BlueExpressDelivery } from "@/lib/api";
import { getColoresHexMap } from "@/actions/extras-meta";
import Link from "next/link";

type EstadoKey = Order["estado"];

const ESTADO_LABEL: Record<EstadoKey, string> = {
  pendiente:   "Pendiente",
  pagado:      "Pagado",
  manufactura: "En manufactura",
  enviado:     "Enviado",
  entregado:   "Entregado",
  cancelado:   "Cancelado",
};

const ESTADO_STYLES: Record<EstadoKey, string> = {
  pendiente:   "bg-amber-100 text-amber-700",
  pagado:      "bg-sky-100 text-sky-700",
  manufactura: "bg-purple-100 text-purple-700",
  enviado:     "bg-indigo-100 text-indigo-700",
  entregado:   "bg-green-100 text-green-700",
  cancelado:   "bg-red-100 text-red-700",
};

// Botón siguiente en el flujo natural del pedido
const NEXT_ESTADO: Partial<Record<EstadoKey, EstadoKey>> = {
  pendiente:   "pagado",
  pagado:      "manufactura",
  manufactura: "enviado",
  enviado:     "entregado",
};

const NEXT_LABEL: Partial<Record<EstadoKey, string>> = {
  pendiente:   "Marcar pagado",
  pagado:      "Iniciar manufactura",
  manufactura: "Marcar enviado",
  enviado:     "Marcar entregado",
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
        {/* Fondo de cuadros: el PNG del diseño tiene transparencia real
            donde el cliente no pinto nada, para que no se confunda con
            "eligio blanco a proposito" — sin este fondo, esas zonas se
            verian negras contra el overlay del modal. */}
        <div
          className="rounded-xl shadow-2xl overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            backgroundColor: '#f0f0f0',
          }}
        >
          <img src={src} alt="Producto diseñado" className="w-full block" />
        </div>
      </div>
    </div>
  );
}

// ── Fila de item dentro de un pedido ─────────────────────────────────────────
function OrderItemRow({
  item,
  coloresMap,
}: {
  item: Order["items"][number];
  coloresMap: Record<string, string>;
}) {
  const [expandedSrc, setExpandedSrc] = useState<string | null>(null);
  const isCustom     = Boolean(item.customDesignImageUrl);
  const hasStamp     = Boolean(item.stampImageUrl);
  const productImg   = item.customDesignImageUrl || item.productImageUrl;
  const colors       = item.chosenColorScheme?.colors ?? [];
  const colorName    = item.chosenColorScheme?.name;
  const extras       = item.chosenExtras ?? [];

  return (
    <>
      {expandedSrc && (
        <ImageModal src={expandedSrc} onClose={() => setExpandedSrc(null)} />
      )}

      <li className="px-5 py-5 flex gap-5 items-start">
        {/* Imagen producto — clic para zoom */}
        <div className="shrink-0">
          {productImg ? (
            <button
              type="button"
              onClick={() => setExpandedSrc(productImg)}
              className="block relative cursor-zoom-in"
              title="Ver imagen ampliada"
            >
              <img
                src={productImg}
                alt={item.productName}
                className="w-24 h-24 rounded-xl object-cover border border-slate-200 shadow-sm hover:opacity-90 transition-opacity"
              />
              {isCustom && (
                <span className="absolute bottom-1.5 right-1.5 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold leading-tight">
                  DISEÑO
                </span>
              )}
            </button>
          ) : (
            <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                <p className="font-semibold text-slate-900">{item.productName}</p>
                {isCustom && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700 shrink-0">
                    Diseñado
                  </span>
                )}
                {hasStamp && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700 shrink-0">
                    Estampado
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">Cantidad: {item.quantity}</p>
            </div>
            <p className="font-bold text-slate-800 shrink-0">${fmt(Number(item.unitPrice) * item.quantity)}</p>
          </div>

          {/* Colores */}
          {(colors.length > 0 || colorName) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-slate-500">Color:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {colors.length > 0 ? (
                  colors.map((c, i) => {
                    const hex = c.startsWith("#") ? c : (coloresMap[c.toLowerCase()] ?? null);
                    return hex ? (
                      <span key={i} title={c}>
                        <span
                          className="inline-block w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-sm"
                          style={{ backgroundColor: hex }}
                        />
                      </span>
                    ) : (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {c}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs font-medium text-slate-700">{colorName}</span>
                )}
              </div>
            </div>
          )}

          {/* Extras */}
          {extras.length > 0 && (
            <p className="text-xs text-slate-500 mt-1.5">
              Extras: {extras.map((e) => e.name).join(", ")}
            </p>
          )}

          {/* Imagen de estampado del cliente */}
          {hasStamp && item.stampImageUrl && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
              <button
                type="button"
                onClick={() => setExpandedSrc(item.stampImageUrl!)}
                className="shrink-0 cursor-zoom-in"
                title="Ver diseño de estampado ampliado"
              >
                <img
                  src={item.stampImageUrl}
                  alt="Diseño a estampar"
                  className="w-16 h-16 rounded-lg object-contain border border-orange-200 bg-white hover:opacity-80 transition-opacity"
                />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-orange-800">Imagen de estampado</p>
                <p className="text-xs text-orange-700 mt-0.5">El cliente subió un diseño para estampar en el producto.</p>
                <button
                  onClick={() => setExpandedSrc(item.stampImageUrl!)}
                  className="mt-1 text-xs text-orange-600 hover:text-orange-800 font-medium underline"
                >
                  Ver ampliada →
                </button>
              </div>
            </div>
          )}
        </div>
      </li>
    </>
  );
}

// ── Tarjeta de pedido ─────────────────────────────────────────────────────────
function OrderCard({
  pedido,
  coloresMap,
  onStatusChange,
  onTrackingChange,
}: {
  pedido: Order;
  coloresMap: Record<string, string>;
  onStatusChange: (id: string, estado: EstadoKey) => Promise<void>;
  onTrackingChange: (id: string, trackingCode: string | null) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [trackingInput, setTrackingInput] = useState(pedido.trackingCode ?? "");
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackingSaved, setTrackingSaved] = useState(false);
  const isBlueExpress =
    (pedido.deliveryAddress as BlueExpressDelivery).type === "blue_express";
  const bep  = isBlueExpress ? (pedido.deliveryAddress as BlueExpressDelivery) : null;
  const addr = !isBlueExpress ? (pedido.deliveryAddress as any) : null;

  const nextEstado = NEXT_ESTADO[pedido.estado];
  const nextLabel  = NEXT_LABEL[pedido.estado];

  async function handleStatus(estado: EstadoKey) {
    setBusy(true);
    await onStatusChange(pedido.id, estado).catch(() => {});
    setBusy(false);
  }

  async function handleSaveTracking() {
    setTrackingBusy(true);
    setTrackingSaved(false);
    await onTrackingChange(pedido.id, trackingInput.trim() || null).catch(() => {});
    setTrackingBusy(false);
    setTrackingSaved(true);
    setTimeout(() => setTrackingSaved(false), 2000);
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
            {ESTADO_LABEL[pedido.estado]}
          </span>
        </div>
      </div>

      {/* Productos */}
      <ul className="divide-y">
        {pedido.items.map((item) => (
          <OrderItemRow key={item.id} item={item} coloresMap={coloresMap} />
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

        {/* Código de seguimiento Blue Express */}
        {isBlueExpress && (
          <div className="w-full mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-600 shrink-0">
              Código seguimiento:
            </label>
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => { setTrackingInput(e.target.value); setTrackingSaved(false); }}
              placeholder="Ej: 123456789"
              className="flex-1 min-w-0 rounded-lg border px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-colonta-primary"
            />
            <button
              disabled={trackingBusy}
              onClick={handleSaveTracking}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0056A2] text-white hover:opacity-90 disabled:opacity-50 shrink-0"
            >
              {trackingBusy ? "Guardando…" : trackingSaved ? "¡Guardado!" : "Guardar"}
            </button>
          </div>
        )}

        {/* Botones de estado — flujo lineal */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {nextEstado && nextLabel && (
            <button
              disabled={busy}
              onClick={() => handleStatus(nextEstado)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-colonta-primary text-white hover:opacity-90 disabled:opacity-50"
            >
              {nextLabel}
            </button>
          )}
          {pedido.estado !== "cancelado" && pedido.estado !== "entregado" && (
            <button
              disabled={busy}
              onClick={() => handleStatus("cancelado")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              Cancelar pedido
            </button>
          )}
          {pedido.estado === "cancelado" && (
            <button
              disabled={busy}
              onClick={() => handleStatus("pendiente")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
            >
              Reactivar
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
  const [filtro, setFiltro]     = useState<"todos" | EstadoKey>("todos");
  const [coloresMap, setColoresMap] = useState<Record<string, string>>({});

  useEffect(() => { loadPedidos(); }, []);

  async function loadPedidos() {
    try {
      setLoading(true);
      const [data, colores] = await Promise.all([
        api.getAllOrdersAdmin(),
        getColoresHexMap(),
      ]);
      setPedidos(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setColoresMap(colores);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, estado: EstadoKey) {
    await api.updateOrderStatus(id, estado);
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado } : p));
  }

  async function handleTrackingChange(id: string, trackingCode: string | null) {
    await api.updateOrderTracking(id, trackingCode);
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, trackingCode } : p));
  }

  const visible = filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);

  const counts: Record<"todos" | EstadoKey, number> = {
    todos:       pedidos.length,
    pendiente:   pedidos.filter((p) => p.estado === "pendiente").length,
    pagado:      pedidos.filter((p) => p.estado === "pagado").length,
    manufactura: pedidos.filter((p) => p.estado === "manufactura").length,
    enviado:     pedidos.filter((p) => p.estado === "enviado").length,
    entregado:   pedidos.filter((p) => p.estado === "entregado").length,
    cancelado:   pedidos.filter((p) => p.estado === "cancelado").length,
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
          <p className="text-white/85 mt-1">Todos los pedidos — imágenes, colores, productos diseñados y punto de retiro</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {(["todos", "pendiente", "pagado", "manufactura", "enviado", "entregado", "cancelado"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtro === f
                    ? "bg-colonta-primary text-white"
                    : "bg-white ring-1 ring-black/10 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f === "todos" ? "Todos" : ESTADO_LABEL[f]}{" "}
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
                coloresMap={coloresMap}
                onStatusChange={handleStatusChange}
                onTrackingChange={handleTrackingChange}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
