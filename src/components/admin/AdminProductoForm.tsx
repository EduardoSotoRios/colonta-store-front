"use client";

import { useState, useTransition } from "react";
import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  agregarImagen,
  eliminarImagen,
  marcarImagenPrincipal,
  actualizarColoresImagen,
} from "@/app/admin/productos/actions";

type Spec      = { label: string; valor: string };
type Color     = { id: number; nombre: string; hex: string | null };
type Imagen    = {
  id: number; url: string; alt: string | null; principal: boolean; orden: number;
  color: number | null; color_secundario: number | null;
  color_terciario: number | null; color_cuaternario: number | null;
};
type Categoria = { slug: string; nombre: string };

type Props = {
  producto:   any | null;
  categorias: Categoria[];
  esNuevo:    boolean;
  colores:    Color[];
};

// ── Selector de color con swatch visual ──────────────────────────────────────
function ColorSelect({
  value, onChange, colores, label,
}: {
  value: string; onChange: (v: string) => void; colores: Color[]; label: string;
}) {
  const selected = colores.find((c) => c.id.toString() === value);
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <span
          className="w-5 h-5 rounded-full border border-slate-200 shrink-0"
          style={{ background: selected?.hex ?? "transparent" }}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-2 py-1.5 text-sm bg-white"
        >
          <option value="">Sin color</option>
          {colores.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const COLOR_LABELS = ["Principal", "Secundario", "Terciario", "Cuaternario"] as const;
const COLOR_KEYS   = ["color", "color_secundario", "color_terciario", "color_cuaternario"] as const;

export default function AdminProductoForm({ producto, categorias, esNuevo, colores }: Props) {
  const [isPending, startTransition] = useTransition();
  const [guardado, setGuardado]      = useState(false);
  const [error, setError]            = useState<string | null>(null);

  const coloresMap = new Map(colores.map((c) => [c.id, c]));

  // Specs
  const [specs, setSpecs] = useState<Spec[]>(
    producto?.producto_specs
      ?.sort((a: any, b: any) => a.orden - b.orden)
      .map((s: any) => ({ label: s.label, valor: s.valor })) ?? []
  );

  // Características
  const [caracs, setCaracs] = useState<string[]>(
    producto?.producto_caracteristicas
      ?.sort((a: any, b: any) => a.orden - b.orden)
      .map((c: any) => c.texto) ?? []
  );

  // Imágenes
  const [imagenes, setImagenes] = useState<Imagen[]>(
    producto?.producto_imagenes?.sort((a: any, b: any) => a.orden - b.orden) ?? []
  );

  // Nueva imagen
  const [nuevaUrl, setNuevaUrl]             = useState("");
  const [nuevaAlt, setNuevaAlt]             = useState("");
  const [nuevaPrincipal, setNuevaPrincipal] = useState(false);
  const [nuevosColores, setNuevosColores]   = useState(["", "", "", ""]);

  // Edición de colores de imagen existente
  const [editColoresId, setEditColoresId]   = useState<number | null>(null);
  const [editColoresArr, setEditColoresArr] = useState(["", "", "", ""]);

  function abrirEditColores(img: Imagen) {
    setEditColoresId(img.id);
    setEditColoresArr(COLOR_KEYS.map((k) => img[k]?.toString() ?? ""));
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("specs",           JSON.stringify(specs));
    fd.set("caracteristicas", JSON.stringify(caracs));
    startTransition(async () => {
      try {
        if (esNuevo) {
          await crearProducto(fd);
        } else {
          await actualizarProducto(producto.id, fd);
          setGuardado(true);
          setTimeout(() => setGuardado(false), 2000);
        }
      } catch (err: any) { setError(err.message); }
    });
  }

  async function handleEliminar() {
    if (!confirm(`¿Eliminar "${producto?.nombre}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      try { await eliminarProducto(producto.id); }
      catch (err: any) { setError(err.message); }
    });
  }

  async function handleAgregarImagen() {
    if (!nuevaUrl.trim()) return;
    const fd = new FormData();
    fd.set("url",       nuevaUrl.trim());
    fd.set("alt",       nuevaAlt.trim());
    fd.set("principal", String(nuevaPrincipal));
    COLOR_KEYS.forEach((k, i) => fd.set(k, nuevosColores[i]));

    startTransition(async () => {
      try {
        await agregarImagen(producto.id, fd);
        setImagenes(prev => [...prev, {
          id: Date.now(), url: nuevaUrl.trim(), alt: nuevaAlt.trim() || null,
          principal: nuevaPrincipal, orden: prev.length + 1,
          color:             nuevosColores[0] ? parseInt(nuevosColores[0]) : null,
          color_secundario:  nuevosColores[1] ? parseInt(nuevosColores[1]) : null,
          color_terciario:   nuevosColores[2] ? parseInt(nuevosColores[2]) : null,
          color_cuaternario: nuevosColores[3] ? parseInt(nuevosColores[3]) : null,
        }]);
        setNuevaUrl(""); setNuevaAlt(""); setNuevaPrincipal(false);
        setNuevosColores(["", "", "", ""]);
      } catch (err: any) { setError(err.message); }
    });
  }

  async function handleEliminarImagen(imagenId: number) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    startTransition(async () => {
      try {
        await eliminarImagen(imagenId, producto.id);
        setImagenes(prev => prev.filter(i => i.id !== imagenId));
      } catch (err: any) { setError(err.message); }
    });
  }

  async function handleMarcarPrincipal(imagenId: number) {
    startTransition(async () => {
      try {
        await marcarImagenPrincipal(imagenId, producto.id);
        setImagenes(prev => prev.map(i => ({ ...i, principal: i.id === imagenId })));
      } catch (err: any) { setError(err.message); }
    });
  }

  async function handleGuardarColores() {
    if (!editColoresId) return;
    const fd = new FormData();
    COLOR_KEYS.forEach((k, i) => fd.set(k, editColoresArr[i]));
    startTransition(async () => {
      try {
        await actualizarColoresImagen(editColoresId, producto.id, fd);
        setImagenes(prev => prev.map(img =>
          img.id !== editColoresId ? img : {
            ...img,
            color:             editColoresArr[0] ? parseInt(editColoresArr[0]) : null,
            color_secundario:  editColoresArr[1] ? parseInt(editColoresArr[1]) : null,
            color_terciario:   editColoresArr[2] ? parseInt(editColoresArr[2]) : null,
            color_cuaternario: editColoresArr[3] ? parseInt(editColoresArr[3]) : null,
          }
        ));
        setEditColoresId(null);
      } catch (err: any) { setError(err.message); }
    });
  }

  const inputCls = "mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-colonta-primary";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
          <h2 className="font-bold text-slate-800">Datos básicos</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre *</label>
              <input name="nombre" required defaultValue={producto?.nombre} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug *</label>
              <input name="slug" required defaultValue={producto?.slug} placeholder="mochila-viajera" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Emoji</label>
              <input name="emoji" defaultValue={producto?.emoji} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoría *</label>
              <select name="categoria_slug" required defaultValue={producto?.categoria_slug ?? "mochilas"}
                className={inputCls}>
                {categorias.map(c => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Badge</label>
              <select name="badge" defaultValue={producto?.badge ?? ""} className={inputCls}>
                <option value="">Sin badge</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Eco">Eco</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio (CLP)</label>
              <input name="precio" type="number" min="0" defaultValue={producto?.precio ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Peso (gramos)</label>
              <input name="peso_g" type="number" min="0" defaultValue={producto?.peso_g ?? ""} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Orden</label>
              <input name="orden" type="number" min="1" defaultValue={producto?.orden ?? 99} className={inputCls} />
            </div>
            <div className="flex items-center gap-4 pt-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="personalizable" value="true"
                  defaultChecked={producto?.personalizable ?? true} className="rounded" />
                Personalizable
              </label>
              {!esNuevo && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="activo" value="true"
                    defaultChecked={producto?.activo ?? true} className="rounded" />
                  Activo
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tagline</label>
            <input name="tagline" defaultValue={producto?.tagline ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Descripción</label>
            <textarea name="descripcion" rows={3} defaultValue={producto?.descripcion ?? ""}
              className={inputCls + " resize-none"} />
          </div>
        </div>

        {/* Especificaciones */}
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Especificaciones</h2>
            <button type="button" onClick={() => setSpecs(p => [...p, { label: "", valor: "" }])}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold">
              + Agregar
            </button>
          </div>
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={s.label} placeholder="Label (ej: Medidas)"
                onChange={e => setSpecs(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                className="w-1/3 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-colonta-primary" />
              <input value={s.valor} placeholder="Valor (ej: 33×45×18 cm)"
                onChange={e => setSpecs(p => p.map((x, j) => j === i ? { ...x, valor: e.target.value } : x))}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-colonta-primary" />
              <button type="button" onClick={() => setSpecs(p => p.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 px-2 text-lg leading-none">×</button>
            </div>
          ))}
          {specs.length === 0 && <p className="text-sm text-slate-400">Sin especificaciones.</p>}
        </div>

        {/* Características */}
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Características</h2>
            <button type="button" onClick={() => setCaracs(p => [...p, ""])}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold">
              + Agregar
            </button>
          </div>
          {caracs.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-slate-400 text-sm w-4">✓</span>
              <input value={c} placeholder="Característica del producto"
                onChange={e => setCaracs(p => p.map((x, j) => j === i ? e.target.value : x))}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-colonta-primary" />
              <button type="button" onClick={() => setCaracs(p => p.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 px-2 text-lg leading-none">×</button>
            </div>
          ))}
          {caracs.length === 0 && <p className="text-sm text-slate-400">Sin características.</p>}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between">
          <div>
            {!esNuevo && (
              <button type="button" onClick={handleEliminar} disabled={isPending}
                className="px-4 py-2.5 rounded-xl font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50">
                Eliminar producto
              </button>
            )}
          </div>
          <button type="submit" disabled={isPending}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 disabled:opacity-50">
            {isPending ? "Guardando..." : guardado ? "✓ Guardado" : esNuevo ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Imágenes — solo en edición */}
      {!esNuevo && (
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
          <h2 className="font-bold text-slate-800">Imágenes</h2>

          {imagenes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagenes.map(img => {
                const imgColorIds = COLOR_KEYS.map(k => img[k]).filter(Boolean) as number[];
                const editando    = editColoresId === img.id;

                return (
                  <div key={img.id} className="space-y-2">
                    {/* Thumbnail con overlay */}
                    <div className="relative group">
                      <div className={`aspect-square rounded-xl overflow-hidden ring-2 ${img.principal ? "ring-colonta-primary" : "ring-slate-100"}`}>
                        <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                      </div>
                      {img.principal && (
                        <span className="absolute top-1 left-1 text-xs bg-colonta-primary text-white px-1.5 py-0.5 rounded-md font-semibold">
                          Principal
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5 flex-wrap p-2">
                        {!img.principal && (
                          <button onClick={() => handleMarcarPrincipal(img.id)}
                            className="text-xs bg-white text-slate-800 px-2 py-1 rounded-lg font-semibold hover:bg-slate-100">
                            Principal
                          </button>
                        )}
                        <button
                          onClick={() => editando ? setEditColoresId(null) : abrirEditColores(img)}
                          className={`text-xs px-2 py-1 rounded-lg font-semibold ${editando ? "bg-colonta-primary text-white" : "bg-white text-slate-800 hover:bg-slate-100"}`}>
                          Colores
                        </button>
                        <button onClick={() => handleEliminarImagen(img.id)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-red-600">
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Swatches actuales */}
                    <div className="flex gap-1.5 flex-wrap px-0.5 min-h-5">
                      {imgColorIds.length > 0
                        ? imgColorIds.map(id => {
                            const c = coloresMap.get(id);
                            return c ? (
                              <span key={id} title={c.nombre}
                                className="w-4 h-4 rounded-full border border-slate-200"
                                style={{ background: c.hex ?? "#ccc" }} />
                            ) : null;
                          })
                        : <span className="text-xs text-slate-400">Sin colores</span>
                      }
                    </div>

                    {/* Editor inline de colores */}
                    {editando && (
                      <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
                        <p className="text-xs font-semibold text-slate-600">Colores de la imagen</p>
                        <div className="grid grid-cols-2 gap-2">
                          {COLOR_LABELS.map((label, i) => (
                            <ColorSelect
                              key={i}
                              label={label}
                              value={editColoresArr[i]}
                              onChange={v => {
                                const next = [...editColoresArr];
                                next[i] = v;
                                setEditColoresArr(next);
                              }}
                              colores={colores}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={handleGuardarColores} disabled={isPending}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-colonta-primary text-white font-semibold hover:opacity-90 disabled:opacity-50">
                            {isPending ? "Guardando..." : "Guardar"}
                          </button>
                          <button onClick={() => setEditColoresId(null)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Agregar nueva imagen */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-sm font-semibold text-slate-600">Agregar imagen</p>
            <input value={nuevaUrl} onChange={e => setNuevaUrl(e.target.value)}
              placeholder="URL de la imagen"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-colonta-primary" />
            <div className="flex gap-3">
              <input value={nuevaAlt} onChange={e => setNuevaAlt(e.target.value)}
                placeholder="Alt (opcional)"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-colonta-primary" />
              <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={nuevaPrincipal} onChange={e => setNuevaPrincipal(e.target.checked)}
                  className="rounded" />
                Principal
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_LABELS.map((label, i) => (
                <ColorSelect
                  key={i}
                  label={`Color ${label.toLowerCase()}`}
                  value={nuevosColores[i]}
                  onChange={v => {
                    const next = [...nuevosColores];
                    next[i] = v;
                    setNuevosColores(next);
                  }}
                  colores={colores}
                />
              ))}
            </div>
            <button onClick={handleAgregarImagen} disabled={!nuevaUrl.trim() || isPending}
              className="w-full px-4 py-2 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 disabled:opacity-50 text-sm">
              {isPending ? "Agregando..." : "Agregar imagen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
