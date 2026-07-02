"use client";

import { useState, useTransition } from "react";
import { crearBanner, actualizarBanner, toggleBanner, eliminarBanner } from "./actions";

type Banner = {
  id: number;
  url: string;
  titulo: string | null;
  subtitulo: string | null;
  cta_texto: string | null;
  cta_href: string | null;
  cta2_texto: string | null;
  cta2_href: string | null;
  orden: number;
  activo: boolean;
};

const EMPTY: Omit<Banner, "id" | "activo"> = {
  url: "", titulo: "", subtitulo: "",
  cta_texto: "", cta_href: "",
  cta2_texto: "", cta2_href: "",
  orden: 99,
};

function BannerForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: typeof EMPTY;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold block mb-1">URL de imagen *</label>
        <input
          name="url"
          required
          defaultValue={initial.url}
          placeholder="https://..."
          className="w-full border rounded-xl px-3 py-2 text-sm"
        />
      </div>

      {initial.url && (
        <img src={initial.url} alt="Preview" className="h-28 rounded-xl object-cover border" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Título</label>
          <input name="titulo" defaultValue={initial.titulo ?? ""} className="w-full border rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Orden</label>
          <input name="orden" type="number" defaultValue={initial.orden} className="w-full border rounded-xl px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1">Subtítulo</label>
        <textarea name="subtitulo" defaultValue={initial.subtitulo ?? ""} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Botón principal — texto</label>
          <input name="cta_texto" defaultValue={initial.cta_texto ?? ""} placeholder="Ver colección" className="w-full border rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Botón principal — enlace</label>
          <input name="cta_href" defaultValue={initial.cta_href ?? ""} placeholder="/mochilas" className="w-full border rounded-xl px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Botón secundario — texto</label>
          <input name="cta2_texto" defaultValue={initial.cta2_texto ?? ""} placeholder="Dale tu sello" className="w-full border rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Botón secundario — enlace</label>
          <input name="cta2_href" defaultValue={initial.cta2_href ?? ""} placeholder="/personalizar" className="w-full border rounded-xl px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-slate-50">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 rounded-xl bg-colonta-primary text-white text-sm font-semibold hover:opacity-90">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminBannersClient({ banners }: { banners: Banner[] }) {
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {/* Nuevo banner */}
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
        {showNew ? (
          <>
            <h2 className="font-bold text-lg mb-4">Nuevo banner</h2>
            <BannerForm
              initial={EMPTY}
              submitLabel="Crear banner"
              onCancel={() => setShowNew(false)}
              onSubmit={(fd) => startTransition(async () => {
                await crearBanner(fd);
                setShowNew(false);
              })}
            />
          </>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-colonta-primary hover:text-colonta-primary text-sm font-semibold transition-colors"
          >
            + Agregar banner
          </button>
        )}
      </div>

      {/* Lista de banners */}
      <div className="space-y-4">
        {banners.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm">No hay banners creados aún.</p>
        )}
        {banners.map((banner) => (
          <div key={banner.id} className={`bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden ${!banner.activo ? "opacity-60" : ""}`}>
            {editId === banner.id ? (
              <div className="p-6">
                <h2 className="font-bold text-lg mb-4">Editar banner</h2>
                <BannerForm
                  initial={banner}
                  submitLabel="Guardar cambios"
                  onCancel={() => setEditId(null)}
                  onSubmit={(fd) => startTransition(async () => {
                    await actualizarBanner(banner.id, fd);
                    setEditId(null);
                  })}
                />
              </div>
            ) : (
              <div className="flex gap-4 p-4">
                {/* Preview */}
                <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img src={banner.url} alt={banner.titulo ?? ""} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 truncate">
                        {banner.titulo || <span className="text-slate-400 italic">Sin título</span>}
                      </p>
                      {banner.subtitulo && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{banner.subtitulo}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">Orden: {banner.orden}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      banner.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {banner.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setEditId(banner.id)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => startTransition(() => toggleBanner(banner.id, !banner.activo))}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50"
                  >
                    {banner.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar este banner?")) {
                        startTransition(() => eliminarBanner(banner.id));
                      }
                    }}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
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
