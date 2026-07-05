"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { REGIONES, COMUNAS_POR_REGION } from "@/lib/chile-geo";
import { api } from "@/lib/api";
import type { Address, BlueExpressDelivery, Order, ProductModel } from "@/lib/api";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";

type EditForm = {
  nombre: string;
  email: string;
  telefono: string;
  newPassword: string;
  direccion: Address;
};

type FavoriteItem = {
  key: string; // id guardado en favoritos: "productId" o "productId:imageId"
  product: ProductModel;
  imageUrl: string;
  colores: Array<{ nombre: string; hex: string | null }>;
};

// El corazon en la ficha de producto guarda "productId:imageId" para recordar
// el recolor exacto elegido, no solo el producto generico.
function parseFavoriteKey(key: string): { productId: string; imageId?: number } {
  const sep = key.indexOf(":");
  if (sep === -1) return { productId: key };
  const imageId = Number(key.slice(sep + 1));
  return { productId: key.slice(0, sep), imageId: Number.isFinite(imageId) ? imageId : undefined };
}

export default function PerfilPage() {
  const { user, hydrate, hydrated, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState<EditForm>({
    nombre: "", email: "", telefono: "", newPassword: "",
    direccion: { street: "", number: "", comuna: "", region: "", postalCode: "" },
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const { favoriteIds, hydrate: hydrateFavs, hydrated: favsHydrated } = useFavorites();
  const [favItems, setFavItems] = useState<FavoriteItem[]>([]);
  const [favsLoading, setFavsLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated) {
      if (!user) { router.push("/login"); return; }
      setPageLoading(false);
      setOrdersLoading(true);
      api.getOrders()
        .then(setOrders)
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
      hydrateFavs(true);
    }
  }, [user, hydrated, router, hydrateFavs]);

  useEffect(() => {
    if (!favsHydrated) return;
    if (favoriteIds.length === 0) { setFavItems([]); return; }
    setFavsLoading(true);
    Promise.all(favoriteIds.map(async (key): Promise<FavoriteItem | null> => {
      const { productId, imageId } = parseFavoriteKey(key);
      try {
        const product = await api.getProductoById(productId);
        const variante = imageId != null
          ? product.imagenes?.find(img => img.id === imageId)
          : undefined;
        return {
          key,
          product,
          imageUrl: variante?.url || product.imageUrl || "",
          colores: variante?.colores ?? [],
        };
      } catch {
        return null;
      }
    }))
      .then(results => setFavItems(results.filter((f): f is FavoriteItem => f !== null)))
      .finally(() => setFavsLoading(false));
  }, [favoriteIds, favsHydrated]);

  function startEdit() {
    if (!user) return;
    setForm({
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      newPassword: "",
      direccion: { ...user.direccion },
    });
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateProfile({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        password: form.newPassword || undefined,
        direccion: form.direccion,
      });
      setSaveSuccess(true);
      setEditing(false);
    } catch (e: any) {
      setSaveError(e?.message ?? "No se pudo guardar");
    }
  }

  const fmt = (n: number | string) =>
    new Intl.NumberFormat("es-CL").format(Number(n));

  if (pageLoading || !user) {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Mi Perfil</h1>
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
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Mi Perfil</h1>
          <p className="text-white/85 mt-2">Información personal y de cuenta</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Notificación de éxito */}
          {saveSuccess && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">
              Perfil actualizado correctamente.
            </div>
          )}

          {/* Información personal */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-lg text-slate-900">Información Personal</h2>
              {!editing && (
                <button
                  onClick={startEdit}
                  className="px-4 py-2 text-sm rounded-xl border font-semibold hover:bg-slate-50 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>

            {!editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre" value={user.nombre} />
                  <Field label="Email" value={user.email} />
                  {user.rut && <Field label="RUT" value={user.rut} />}
                  {user.telefono && <Field label="Teléfono" value={user.telefono} />}
                  <Field
                    label="Rol"
                    value={
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-colonta-primary/10 text-colonta-primary">
                        {user.rol === "admin" ? "Administrador" : "Cliente"}
                      </span>
                    }
                  />
                </div>

                {user.direccion?.street && (
                  <div className="border-t pt-5 mt-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Dirección de Envío</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Calle" value={user.direccion.street} />
                      <Field label="Número" value={user.direccion.number} />
                      <Field label="Comuna" value={user.direccion.comuna} />
                      <Field label="Región" value={user.direccion.region} />
                      <Field label="Código Postal" value={user.direccion.postalCode} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={onSave} className="space-y-4">
                {saveError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {saveError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Nombre</label>
                    <input
                      type="text" required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Email</label>
                    <input
                      type="email" required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Teléfono</label>
                    <input
                      type="tel"
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="+56 9 12345678"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">
                      Nueva contraseña <span className="text-slate-400 font-normal">(dejar vacío para no cambiar)</span>
                    </label>
                    <input
                      type="password"
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-3">Dirección de envío</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold block mb-1">Calle</label>
                      <input
                        type="text"
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={form.direccion.street}
                        onChange={(e) => setForm({ ...form, direccion: { ...form.direccion, street: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Número</label>
                      <input
                        type="text"
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={form.direccion.number}
                        onChange={(e) => setForm({ ...form, direccion: { ...form.direccion, number: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Región</label>
                      <select
                        className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                        value={form.direccion.region}
                        onChange={(e) => setForm({ ...form, direccion: { ...form.direccion, region: e.target.value, comuna: "" } })}
                      >
                        <option value="">Selecciona una región</option>
                        {REGIONES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Comuna</label>
                      <select
                        className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                        value={form.direccion.comuna}
                        disabled={!form.direccion.region}
                        onChange={(e) => setForm({ ...form, direccion: { ...form.direccion, comuna: e.target.value } })}
                      >
                        <option value="">
                          {form.direccion.region ? "Selecciona una comuna" : "Selecciona primero una región"}
                        </option>
                        {(COMUNAS_POR_REGION[form.direccion.region] ?? []).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Código postal</label>
                      <input
                        type="text"
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={form.direccion.postalCode}
                        onChange={(e) => setForm({ ...form, direccion: { ...form.direccion, postalCode: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {authLoading ? "Guardando…" : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-5 py-2 rounded-xl border font-semibold hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Historial de órdenes */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 bg-white">
            <h2 className="font-extrabold text-lg text-slate-900 mb-5">Mis Pedidos</h2>

            {ordersLoading ? (
              <p className="text-sm text-slate-500">Cargando pedidos…</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Todavía no tienes pedidos.</p>
                <Link href="/mochilas" className="mt-3 inline-block text-sm text-colonta-primary font-semibold underline">
                  Ir a la tienda
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} fmt={fmt} />
                ))}
              </div>
            )}
          </div>

          {/* Favoritos */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 bg-white">
            <h2 className="font-extrabold text-lg text-slate-900 mb-5">Mis Favoritos</h2>

            {favsLoading ? (
              <p className="text-sm text-slate-500">Cargando favoritos…</p>
            ) : favItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Todavía no tienes productos favoritos.</p>
                <Link href="/mochilas" className="mt-3 inline-block text-sm text-colonta-primary font-semibold underline">
                  Explorar productos
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favItems.map(item => {
                  const { product: p, colores } = item;
                  const priceCL = new Intl.NumberFormat("es-CL").format(Number(p.basePrice));
                  return (
                    <li key={item.key} className="rounded-xl border bg-slate-50 overflow-hidden flex flex-col">
                      <Link href={`/mochilas/${p.id}`} className="block">
                        <div className="aspect-[4/5] bg-slate-200">
                          <img
                            src={item.imageUrl || "/mochila1.png"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="p-3 flex flex-col gap-2">
                        <Link href={`/mochilas/${p.id}`}>
                          <p className="text-sm font-semibold leading-snug">{p.name}</p>
                          {colores.length > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {colores.map(c => c.nombre).join(" / ")}
                            </p>
                          )}
                          {Number(p.basePrice) > 0 && (
                            <p className="text-sm font-extrabold mt-0.5">${priceCL}</p>
                          )}
                        </Link>
                        <FavoriteButton productId={item.key} className="w-full justify-center text-xs py-1.5" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <Link
              href="/mochilas"
              className="px-5 py-2 rounded-xl border font-semibold hover:bg-slate-50 transition-colors"
            >
              Seguir comprando
            </Link>
            <Link
              href="/cart"
              className="px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Ver carrito
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Barra de progreso de etapas ───────────────────────────────────────────────
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
      <div className="flex items-center gap-0">
        {ETAPAS.map((etapa, idx) => {
          const done    = idx < activeIdx;
          const current = idx === activeIdx;
          const isLast  = idx === ETAPAS.length - 1;
          return (
            <div key={etapa.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                    done
                      ? "bg-green-500 border-green-500 text-white"
                      : current
                      ? "bg-colonta-primary border-colonta-primary text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {done ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`mt-1 text-[9px] font-medium text-center leading-tight w-14 ${
                  done ? "text-green-600" : current ? "text-colonta-primary" : "text-slate-400"
                }`}>
                  {etapa.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${done ? "bg-green-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tarjeta de pedido en el perfil ────────────────────────────────────────────
function OrderCard({ order, fmt }: { order: Order; fmt: (n: number | string) => string }) {
  const badge = ESTADO_BADGE[order.estado];
  const bep = (order.deliveryAddress as BlueExpressDelivery).type === "blue_express"
    ? (order.deliveryAddress as BlueExpressDelivery)
    : null;

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b bg-slate-50">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Orden #{order.id.slice(0, 8)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("es-CL", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-extrabold">${fmt(order.total)}</p>
          <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="px-4 pb-1">
        <OrderProgressBar estado={order.estado} />
      </div>

      {/* Productos */}
      <ul className="px-4 pb-3 space-y-3 mt-2">
        {order.items.map((item, idx) => {
          const imgSrc   = item.customDesignImageUrl || item.productImageUrl;
          const isCustom = Boolean(item.customDesignImageUrl);
          const colorName = item.chosenColorScheme?.name;
          const colors    = item.chosenColorScheme?.colors ?? [];
          return (
            <li key={idx} className="flex items-start gap-3">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={item.productName}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {isCustom && (
                    <span className="mr-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 align-middle">
                      DISEÑO
                    </span>
                  )}
                  {item.productName}
                  {item.quantity > 1 && (
                    <span className="text-slate-400 font-normal ml-1">× {item.quantity}</span>
                  )}
                </p>
                {(colorName || colors.length > 0) && (
                  <div className="flex items-center gap-1.5 mt-1">
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
              <span className="text-xs font-semibold text-slate-600 flex-shrink-0 pt-0.5">
                ${fmt(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Punto de retiro */}
      {bep ? (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
          <svg className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-800">{bep.name}</p>
            <p className="text-xs text-blue-600">{bep.address}, {bep.comuna}</p>
          </div>
        </div>
      ) : (
        order.deliveryAddress && (order.deliveryAddress as any).street && (
          <p className="mx-4 mb-4 text-xs text-slate-500">
            {(order.deliveryAddress as any).street} {(order.deliveryAddress as any).number},{" "}
            {(order.deliveryAddress as any).comuna}
          </p>
        )
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
