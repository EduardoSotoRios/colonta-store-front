"use client";

import { useState } from "react";
import { guardarPaginaContenido, restaurarPaginaContenido, subirImagenSeccion } from "../actions";
import type { PaginaInfoSlug } from "@/lib/paginasInfo";
import PaginaInfoRender from "@/components/PaginaInfoRender";

// El contenido guardado (o los valores por defecto) puede traer bloques
// de texto viejos sin "tipo" — se tratan como "texto" al armar las filas.
type SeccionEntrada = { tipo?: "texto" | "imagen"; titulo?: string; cuerpo?: string; url?: string };
type Contenido = { titulo: string; subtitulo: string | null; secciones: SeccionEntrada[] };

const TAMANO_MAXIMO_IMAGEN = 8 * 1024 * 1024; // igual al límite configurado para Server Actions

// Fila es siempre el mismo objeto plano (texto e imagen comparten forma)
// para no pelear con el angostamiento de tipos de TS en un union mutable.
type Fila = { key: string; tipo: "texto" | "imagen"; titulo: string; cuerpo: string; url: string };

let nextRowKey = 0;
function newRowKey() {
  return `row-${nextRowKey++}`;
}

export default function MantenimientoEditor({
  slug,
  contenido,
  personalizada,
}: {
  slug: PaginaInfoSlug;
  contenido: Contenido;
  personalizada: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  // Estado controlado para que la vista previa se actualice en vivo
  // mientras se escribe, no solo después de guardar.
  const [titulo, setTitulo] = useState(contenido.titulo);
  const [subtitulo, setSubtitulo] = useState(contenido.subtitulo ?? "");
  const [rows, setRows] = useState<Fila[]>(
    (contenido.secciones.length > 0
      ? contenido.secciones
      : [{ titulo: "", cuerpo: "" }]
    ).map((s) => ({
      key: newRowKey(),
      tipo: s.tipo === "imagen" ? "imagen" : "texto",
      titulo: s.titulo ?? "",
      cuerpo: s.cuerpo ?? "",
      url: s.url ?? "",
    }))
  );

  function actualizarFila(key: string, campo: "titulo" | "cuerpo" | "url", valor: string) {
    setRows((p) => p.map((r) => (r.key === key ? { ...r, [campo]: valor } : r)));
  }

  const [subiendoImagen, setSubiendoImagen] = useState<Record<string, boolean>>({});

  async function handleArchivoSeleccionado(key: string, file: File | undefined) {
    if (!file) return;
    if (file.size > TAMANO_MAXIMO_IMAGEN) {
      alert("La imagen es muy pesada (máx. 8 MB). Comprímela o elige otra.");
      return;
    }
    setSubiendoImagen((p) => ({ ...p, [key]: true }));
    try {
      const fd = new FormData();
      fd.set("file", file);
      const url = await subirImagenSeccion(fd);
      actualizarFila(key, "url", url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setSubiendoImagen((p) => ({ ...p, [key]: false }));
    }
  }

  // Reordenar secciones arrastrando — dragKey es la que se está moviendo.
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  function moverSeccion(desdeKey: string, haciaKey: string) {
    if (desdeKey === haciaKey) return;
    setRows((p) => {
      const desde = p.findIndex((r) => r.key === desdeKey);
      const hacia = p.findIndex((r) => r.key === haciaKey);
      if (desde === -1 || hacia === -1) return p;
      const copia = [...p];
      const [movida] = copia.splice(desde, 1);
      copia.splice(hacia, 0, movida);
      return copia;
    });
  }

  function mensajeError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg || msg.toLowerCase().includes("server components render")) {
      return "Ocurrió un error al guardar. Si la migración SQL de 'paginas_contenido' no se ha corrido en Supabase, esa suele ser la causa.";
    }
    if (msg.toLowerCase().includes("was not found on the server")) {
      return "La página quedó con una versión vieja cargada (el sitio se actualizó mientras la tenías abierta). Recarga la página (F5) y vuelve a intentar guardar.";
    }
    return msg;
  }

  async function handleSubmit(fd: FormData) {
    setError(null);
    setSaving(true);
    try {
      await guardarPaginaContenido(slug, fd);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRestaurar() {
    if (!confirm("¿Restaurar el contenido original de esta página? Se perderán los cambios personalizados.")) return;
    setError(null);
    setRestaurando(true);
    try {
      await restaurarPaginaContenido(slug);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setRestaurando(false);
    }
  }

  const seccionesPreview = rows.map((r) => ({ tipo: r.tipo, titulo: r.titulo, cuerpo: r.cuerpo, url: r.url }));

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {!personalizada && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          Esta página todavía muestra su contenido original — lo de abajo es ese mismo texto, precargado
          para que puedas probar editarlo. Si guardas, reemplazarás el contenido original por lo que haya
          en este formulario.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Formulario */}
        <form action={handleSubmit} className="space-y-6 min-w-0">
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Título de la página</label>
              <input
                name="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Subtítulo (opcional)</label>
              <input
                name="subtitulo"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-slate-800">Secciones</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRows((p) => [...p, { key: newRowKey(), tipo: "texto", titulo: "", cuerpo: "", url: "" }])}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  + Agregar sección
                </button>
                <button
                  type="button"
                  onClick={() => setRows((p) => [...p, { key: newRowKey(), tipo: "imagen", titulo: "", cuerpo: "", url: "" }])}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  + Agregar imagen
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-0.5">
              <p>Cada línea nueva es un párrafo distinto. Formato disponible:</p>
              <p><code className="bg-slate-100 px-1 rounded">**palabra**</code> → negrita</p>
              <p><code className="bg-slate-100 px-1 rounded">1. texto</code> → paso numerado (círculo)</p>
              <p><code className="bg-slate-100 px-1 rounded">- texto</code> → ítem de lista con flecha morada (➢)</p>
              <p>
                <code className="bg-slate-100 px-1 rounded">* texto</code> abre una caja gris, y{" "}
                <code className="bg-slate-100 px-1 rounded">texto *</code> la cierra. Las líneas de
                en medio no necesitan nada especial. Para una sola línea, poné el <code className="bg-slate-100 px-1 rounded">*</code> al
                principio y al final de esa misma línea.
              </p>
              <p>
                Igual pero con <code className="bg-slate-100 px-1 rounded">&gt;</code> para un
                bloque destacado de color en vez de caja gris.
              </p>
              <p className="pt-1">
                Si necesitas que una línea empiece justo con un número+punto, un guión, o un{" "}
                <code className="bg-slate-100 px-1 rounded">*</code>/<code className="bg-slate-100 px-1 rounded">&gt;</code> sin
                que se interprete como formato, reordena la frase para que no quede al principio de la línea.
              </p>
              <p className="pt-1">
                "+ Agregar imagen" crea un bloque de foto que se puede ordenar junto con las secciones
                de texto (arrastrando o con las flechas ↑/↓), igual que cualquier otra sección.
              </p>
            </div>

            <div className="space-y-4">
              {rows.map((row, i) => (
                <div
                  key={row.key}
                  draggable
                  onDragStart={() => setDragKey(row.key)}
                  onDragOver={(e) => { e.preventDefault(); if (dragKey && dragKey !== row.key) setOverKey(row.key); }}
                  onDragLeave={() => setOverKey((k) => (k === row.key ? null : k))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragKey) moverSeccion(dragKey, row.key);
                    setDragKey(null);
                    setOverKey(null);
                  }}
                  onDragEnd={() => { setDragKey(null); setOverKey(null); }}
                  className={`border-2 rounded-xl p-4 space-y-2 transition-colors ${
                    overKey === row.key ? "border-colonta-primary bg-colonta-primary/5" : "border-slate-200"
                  } ${dragKey === row.key ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span className="cursor-grab active:cursor-grabbing select-none text-slate-300 hover:text-slate-500" title="Arrastrar para reordenar">
                        ⠿
                      </span>
                      {row.tipo === "imagen" ? "Imagen" : "Sección"} {i + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => i > 0 && moverSeccion(row.key, rows[i - 1].key)}
                        disabled={i === 0}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 text-xs"
                        title="Mover arriba"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => i < rows.length - 1 && moverSeccion(row.key, rows[i + 1].key)}
                        disabled={i === rows.length - 1}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 text-xs"
                        title="Mover abajo"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => setRows((p) => p.filter((r) => r.key !== row.key))}
                        className="text-red-400 hover:text-red-600 text-xs font-semibold"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <input type="hidden" name="seccion_tipo" value={row.tipo} />
                  {row.tipo === "imagen" ? (
                    <>
                      <input type="hidden" name="seccion_cuerpo" value="" />
                      <input
                        name="seccion_titulo"
                        value={row.titulo}
                        onChange={(e) => actualizarFila(row.key, "titulo", e.target.value)}
                        placeholder="Descripción de la imagen (opcional)"
                        className="w-full border rounded-xl px-3 py-2 text-sm font-semibold"
                      />
                      <div className="flex gap-2">
                        <input
                          name="seccion_url"
                          value={row.url}
                          onChange={(e) => actualizarFila(row.key, "url", e.target.value)}
                          placeholder="https:// (o sube un archivo →)"
                          className="flex-1 border rounded-xl px-3 py-2 text-sm"
                        />
                        <label
                          className={`shrink-0 px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer hover:bg-slate-50 ${
                            subiendoImagen[row.key] ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          {subiendoImagen[row.key] ? "Subiendo…" : "Subir archivo"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={subiendoImagen[row.key]}
                            onChange={(e) => {
                              handleArchivoSeleccionado(row.key, e.target.files?.[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      {row.url && (
                        <img src={row.url} alt="" className="max-h-48 rounded-xl border object-contain" />
                      )}
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="seccion_url" value="" />
                      <input
                        name="seccion_titulo"
                        value={row.titulo}
                        onChange={(e) => actualizarFila(row.key, "titulo", e.target.value)}
                        placeholder="Título de la sección (ej: Garantía)"
                        className="w-full border rounded-xl px-3 py-2 text-sm font-semibold"
                      />
                      <textarea
                        name="seccion_cuerpo"
                        value={row.cuerpo}
                        onChange={(e) => actualizarFila(row.key, "cuerpo", e.target.value)}
                        rows={5}
                        placeholder="Texto de la sección..."
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
              {rows.length === 0 && <p className="text-sm text-slate-400">Sin secciones.</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleRestaurar}
              disabled={restaurando || saving || !personalizada}
              className="px-4 py-2.5 rounded-xl font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40"
            >
              {restaurando ? "Restaurando…" : "Restaurar contenido original"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando…" : guardado ? "✓ Guardado" : "Guardar cambios"}
            </button>
          </div>
        </form>

        {/* Vista previa en vivo */}
        <div className="lg:sticky lg:top-6 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Vista previa en vivo
          </p>
          <div className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden">
            <div className="max-h-[80vh] overflow-y-auto">
              <PaginaInfoRender titulo={titulo || "(sin título)"} subtitulo={subtitulo || null} secciones={seccionesPreview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
