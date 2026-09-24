"use client";

import { useState, useTransition } from "react";
import { crearBanner, actualizarBanner, toggleBanner, eliminarBanner, subirImagenBanner } from "./actions";

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
  error,
}: {
  initial: typeof EMPTY;
  onSubmit: (fd: FormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  error: string | null;
}) {
  const [url, setUrl] = useState(initial.url);
  const [subiendo, setSubiendo] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const nuevaUrl = await subirImagenBanner(fd);
      setUrl(nuevaUrl);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

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
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-semibold block mb-1">Imagen de fondo *</label>
        <div className="flex gap-2">
          <input
            name="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https:// (o sube un archivo →)"
            className="flex-1 border rounded-xl px-3 py-2 text-sm"
          />
          <label className={`shrink-0 px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer hover:bg-slate-50 ${subiendo ? "opacity-50 pointer-events-none" : ""}`}>
            {subiendo ? "Subiendo…" : "Subir archivo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleArchivoSeleccionado} disabled={subiendo} />
          </label>
        </div>
      </div>

      {url && (
        <img src={url} alt="Preview" className="h-28 rounded-xl object-cover border" />
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
        <button type="button" onClick={onCancel} disabled={saving} className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-colonta-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
          {saving ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminBannersClient({ banners }: { banners: Banner[] }) {
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  function mensajeError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    return msg || "Error al guardar el banner.";
  }

  return (
    <div className="space-y-6">
      {listError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {listError}
        </div>
      )}

      {/* Nuevo banner */}
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6">
        {showNew ? (
          <>
            <h2 className="font-bold text-lg mb-4">Nuevo banner</h2>
            <BannerForm
              initial={EMPTY}
              submitLabel="Crear banner"
              error={formError}
              onCancel={() => { setShowNew(false); setFormError(null); }}
              onSubmit={async (fd) => {
                setFormError(null);
                try {
                  await crearBanner(fd);
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
                  error={formError}
                  onCancel={() => { setEditId(null); setFormError(null); }}
                  onSubmit={async (fd) => {
                    setFormError(null);
                    try {
                      await actualizarBanner(banner.id, fd);
                      startTransition(() => setEditId(null));
                    } catch (err) {
                      setFormError(mensajeError(err));
                    }
                  }}
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
                      {(banner.cta_texto || banner.cta2_texto) && (
                        <p className="text-xs text-slate-400 mt-1">
                          Botones: {[banner.cta_texto, banner.cta2_texto].filter(Boolean).join(", ")}
                        </p>
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
                    onClick={() => { setEditId(banner.id); setFormError(null); }}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => startTransition(async () => {
                      setListError(null);
                      try {
                        await toggleBanner(banner.id, !banner.activo);
                      } catch (err) {
                        setListError(mensajeError(err));
                      }
                    })}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50"
                  >
                    {banner.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar este banner?")) {
                        startTransition(async () => {
                          setListError(null);
                          try {
                            await eliminarBanner(banner.id);
                          } catch (err) {
                            setListError(mensajeError(err));
                          }
                        });
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
