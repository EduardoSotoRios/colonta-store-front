"use client";

import { useState, useTransition } from "react";
import {
  crearOfertaCarrito,
  actualizarOfertaCarrito,
  toggleOfertaCarrito,
  eliminarOfertaCarrito,
  type CartOfferAdmin,
} from "./actions";

const CLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

type Producto = { slug: string; nombre: string };

type FormValues = {
  umbral_minimo: number;
  producto_slug: string;
  precio_oferta: number;
  orden: number;
};

const EMPTY: FormValues = { umbral_minimo: 20000, producto_slug: "", precio_oferta: 990, orden: 0 };

function OfertaForm({
  initial,
  productos,
  onSubmit,
  onCancel,
  submitLabel,
  error,
}: {
  initial: FormValues;
  productos: Producto[];
  onSubmit: (fd: FormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  error: string | null;
}) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (fd: FormData) => {
    setSaving(true);
    try {
      await onSubmit(fd);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">
            Umbral mínimo del carrito *
            <span className="font-normal text-slate-400 ml-1">(CLP)</span>
          </label>
          <input
            name="umbral_minimo"
            type="number"
            required
            min={1}
            defaultValue={initial.umbral_minimo}
            placeholder="20000"
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">Monto a partir del cual se desbloquea la oferta.</p>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">
            Precio oferta *
            <span className="font-normal text-slate-400 ml-1">(CLP)</span>
          </label>
          <input
            name="precio_oferta"
            type="number"
            required
            min={0}
            defaultValue={initial.precio_oferta}
            placeholder="990"
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">Precio especial al que el cliente puede agregar el producto.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Producto *</label>
          {productos.length > 0 ? (
            <select
              name="producto_slug"
              required
              defaultValue={initial.producto_slug}
              className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="">— Selecciona un producto —</option>
              {productos.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.nombre} ({p.slug})
                </option>
              ))}
            </select>
          ) : (
            <input
              name="producto_slug"
              required
              defaultValue={initial.producto_slug}
              placeholder="slug-del-producto"
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
          )}
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Orden</label>
          <input
            name="orden"
            type="number"
            min={0}
            defaultValue={initial.orden}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">Orden de aparición (menor = primero).</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-colonta-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminCartOffersClient({
  offers,
  productos,
}: {
  offers: CartOfferAdmin[];
  productos: Producto[];
}) {
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  function mensajeError(err: unknown): string {
    return err instanceof Error ? err.message : String(err) || "Error al guardar.";
  }

  return (
    <div className="space-y-6">
      {listError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {listError}
        </div>
      )}

      {/* Explicación */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">¿Cómo funcionan las ofertas de carrito?</p>
        <p>
          Cuando el subtotal del carrito supera el <strong>umbral mínimo</strong>, el cliente puede agregar
          el producto seleccionado al <strong>precio oferta</strong>. Se muestran como productos desbloqueados
          con una barra de progreso en el carrito.
        </p>
      </div>

      {/* Nueva oferta */}
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
        {showNew ? (
          <>
            <h2 className="font-bold text-lg mb-4">Nueva oferta de carrito</h2>
            <OfertaForm
              initial={EMPTY}
              productos={productos}
              submitLabel="Crear oferta"
              error={formError}
              onCancel={() => { setShowNew(false); setFormError(null); }}
              onSubmit={async (fd) => {
                setFormError(null);
                try {
                  await crearOfertaCarrito(fd);
                  startTransition(() => setShowNew(false));
                } catch (err) {
                  setFormError(mensajeError(err));
                }
              }}
            />
          </>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-colonta-primary hover:text-colonta-primary text-sm font-semibold transition-colors"
          >
            + Agregar oferta de carrito
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {offers.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm">No hay ofertas configuradas aún.</p>
        )}

        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden ${!offer.activo ? "opacity-60" : ""}`}
          >
            {editId === offer.id ? (
              <div className="p-6">
                <h2 className="font-bold text-lg mb-4">Editar oferta</h2>
                <OfertaForm
                  initial={{
                    umbral_minimo: offer.umbral_minimo,
                    producto_slug: offer.producto_slug,
                    precio_oferta: offer.precio_oferta,
                    orden: offer.orden,
                  }}
                  productos={productos}
                  submitLabel="Guardar cambios"
                  error={formError}
                  onCancel={() => { setEditId(null); setFormError(null); }}
                  onSubmit={async (fd) => {
                    setFormError(null);
                    try {
                      await actualizarOfertaCarrito(offer.id, fd);
                      startTransition(() => setEditId(null));
                    } catch (err) {
                      setFormError(mensajeError(err));
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4">
                {/* Icono */}
                <div className="w-12 h-12 rounded-xl bg-colonta-primary/10 flex items-center justify-center text-xl shrink-0">
                  🛒
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">
                    {offer.producto_nombre ?? offer.producto_slug}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                    <span>
                      Umbral: <strong className="text-slate-700">{CLP(offer.umbral_minimo)}</strong>
                    </span>
                    <span>
                      Precio oferta: <strong className="text-colonta-primary">{CLP(offer.precio_oferta)}</strong>
                    </span>
                    <span className="text-slate-400">
                      Slug: {offer.producto_slug} · Orden: {offer.orden}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    offer.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {offer.activo ? "Activa" : "Inactiva"}
                </span>

                {/* Acciones */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => { setEditId(offer.id); setFormError(null); }}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        setListError(null);
                        try {
                          await toggleOfertaCarrito(offer.id, !offer.activo);
                        } catch (err) {
                          setListError(mensajeError(err));
                        }
                      })
                    }
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    {offer.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta oferta de carrito?")) {
                        startTransition(async () => {
                          setListError(null);
                          try {
                            await eliminarOfertaCarrito(offer.id);
                          } catch (err) {
                            setListError(mensajeError(err));
                          }
                        });
                      }
                    }}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
