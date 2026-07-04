"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { REGIONES, COMUNAS_POR_REGION } from "@/lib/chile-geo";
import { api } from "@/lib/api";
import type { Address, Order, ProductModel } from "@/lib/api";
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
  const [favProducts, setFavProducts] = useState<ProductModel[]>([]);
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
    if (favoriteIds.length === 0) { setFavProducts([]); return; }
    setFavsLoading(true);
    Promise.all(favoriteIds.map(id => api.productById(id).catch(() => null)))
      .then(results => setFavProducts(results.filter((p): p is ProductModel => p !== null)))
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
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-xl border p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Orden #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("es-CL", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {order.deliveryAddress.street} {order.deliveryAddress.number},{" "}
                          {order.deliveryAddress.comuna}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-extrabold">${fmt(order.total)}</p>
                        <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.estado === "pagado"
                            ? "bg-green-100 text-green-700"
                            : order.estado === "cancelado"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.estado === "pagado" ? "Pagado" :
                           order.estado === "cancelado" ? "Cancelado" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favoritos */}
          <div className="rounded-2xl ring-1 ring-black/5 p-6 bg-white">
            <h2 className="font-extrabold text-lg text-slate-900 mb-5">Mis Favoritos</h2>

            {favsLoading ? (
              <p className="text-sm text-slate-500">Cargando favoritos…</p>
            ) : favProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Todavía no tienes productos favoritos.</p>
                <Link href="/mochilas" className="mt-3 inline-block text-sm text-colonta-primary font-semibold underline">
                  Explorar productos
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favProducts.map(p => {
                  const priceCL = new Intl.NumberFormat("es-CL").format(Number(p.basePrice));
                  return (
                    <li key={p.id} className="rounded-xl border bg-slate-50 overflow-hidden flex flex-col">
                      <Link href={`/mochilas/${p.id}`} className="block">
                        <div className="aspect-[4/5] bg-slate-200">
                          <img
                            src={p.imageUrl || "/mochila1.png"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="p-3 flex flex-col gap-2">
                        <Link href={`/mochilas/${p.id}`}>
                          <p className="text-sm font-semibold leading-snug">{p.name}</p>
                          {Number(p.basePrice) > 0 && (
                            <p className="text-sm font-extrabold mt-0.5">${priceCL}</p>
                          )}
                        </Link>
                        <FavoriteButton productId={p.id} className="w-full justify-center text-xs py-1.5" />
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
