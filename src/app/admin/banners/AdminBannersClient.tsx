"use client";

import { useState, useTransition } from "react";
import { crearBanner, actualizarBanner, toggleBanner, eliminarBanner, subirImagenBanner } from "./actions";

type Boton = { texto: string; href: string };

type Banner = {
  id: number;
  url: string;
  titulo: string | null;
  subtitulo: string | null;
  botones: Boton[] | null;
  orden: number;
  activo: boolean;
};

const EMPTY: Omit<Banner, "id" | "activo"> = {
  url: "", titulo: "", subtitulo: "",
  botones: [],
  orden: 99,
};

let nextRowKey = 0;
function newRowKey() {
  return `row-${nextRowKey++}`;
}

function BannerForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  error,
}: {
  initial: typeof EMPTY;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
  submitLabel: string;
  error: string | null;
}) {
  const [url, setUrl]         = useState(initial.url);
  const [subiendo, setSubiendo] = useState(false);
  const [rows, setRows] = useState<{ key: string; texto: string; href: string }[]>(
    (initial.botones && initial.botones.length > 0 ? initial.botones : [{ texto: "", href: "" }])
      .map((b) => ({ key: newRowKey(), texto: b.texto, href: b.href }))
  );

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

  return (
    <form action={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
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

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold block">Botones</label>
          <button
            type="button"
            onClick={() => setRows((p) => [...p, { key: newRowKey(), texto: "", href: "" }])}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold"
          >
            + Agregar botón
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={row.key} className="flex gap-2 items-center">
              <input
                name="boton_texto"
                defaultValue={row.texto}
                placeholder={i === 0 ? "Ver colección" : "Texto del botón"}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
              />
              <input
                name="boton_href"
                defaultValue={row.href}
                placeholder={i === 0 ? "/mochilas" : "/pagina"}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setRows((p) => p.filter((r) => r.key !== row.key))}
                className="text-red-400 hover:text-red-600 px-2 text-lg leading-none shrink-0"
                aria-label="Quitar botón"
              >
                ×
              </button>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-400">Sin botones.</p>}
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
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  function mensajeError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("botones") && (msg.includes("does not exist") || msg.includes("schema cache"))) {
      return "Falta correr la migración de base de datos (columna 'botones'). Ejecuta el SQL que te compartimos en el editor de Supabase antes de guardar botones.";
    }
    return msg;
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
              onSubmit={(fd) => startTransition(async () => {
                setFormError(null);
                try {
                  await crearBanner(fd);
                  setShowNew(false);
                } catch (err) {
                  setFormError(mensajeError(err));
                }
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
                  error={editId === banner.id ? formError : null}
                  onCancel={() => { setEditId(null); setFormError(null); }}
                  onSubmit={(fd) => startTransition(async () => {
                    setFormError(null);
                    try {
                      await actualizarBanner(banner.id, fd);
                      setEditId(null);
                    } catch (err) {
                      setFormError(mensajeError(err));
                    }
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
                      {banner.botones && banner.botones.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          Botones: {banner.botones.map((b) => b.texto).join(", ")}
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
