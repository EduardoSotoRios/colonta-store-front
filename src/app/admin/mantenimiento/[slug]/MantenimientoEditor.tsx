"use client";

import { useState, useTransition } from "react";
import { guardarPaginaContenido, restaurarPaginaContenido } from "../actions";
import type { PaginaInfoSlug } from "@/lib/paginasInfo";

type Seccion = { titulo: string; cuerpo: string };
type Contenido = { titulo: string; subtitulo: string | null; secciones: Seccion[] };

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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const [rows, setRows] = useState<{ key: string; titulo: string; cuerpo: string }[]>(
    (contenido.secciones.length > 0
      ? contenido.secciones
      : [{ titulo: "", cuerpo: "" }]
    ).map((s) => ({ key: newRowKey(), titulo: s.titulo, cuerpo: s.cuerpo }))
  );

  function mensajeError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    const generico = !msg || msg.toLowerCase().includes("server components render");
    const hint = "Si no lo has hecho, corre la migración SQL de la tabla 'paginas_contenido' en el editor de Supabase antes de guardar.";
    return generico ? hint : `${msg}\n\n${hint}`;
  }

  async function handleSubmit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await guardarPaginaContenido(slug, fd);
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2000);
      } catch (err) {
        setError(mensajeError(err));
      }
    });
  }

  async function handleRestaurar() {
    if (!confirm("¿Restaurar el contenido original de esta página? Se perderán los cambios personalizados.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await restaurarPaginaContenido(slug);
      } catch (err) {
        setError(mensajeError(err));
      }
    });
  }

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

      <form action={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Título de la página</label>
            <input
              name="titulo"
              defaultValue={contenido.titulo}
              required
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Subtítulo (opcional)</label>
            <input
              name="subtitulo"
              defaultValue={contenido.subtitulo ?? ""}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Secciones</h2>
            <button
              type="button"
              onClick={() => setRows((p) => [...p, { key: newRowKey(), titulo: "", cuerpo: "" }])}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold"
            >
              + Agregar sección
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Usa **palabra** para poner texto en negrita. Cada línea nueva es un párrafo distinto.
          </p>

          <div className="space-y-4">
            {rows.map((row, i) => (
              <div key={row.key} className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400">Sección {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setRows((p) => p.filter((r) => r.key !== row.key))}
                    className="text-red-400 hover:text-red-600 text-xs font-semibold"
                  >
                    Quitar
                  </button>
                </div>
                <input
                  name="seccion_titulo"
                  defaultValue={row.titulo}
                  placeholder="Título de la sección (ej: Garantía)"
                  className="w-full border rounded-xl px-3 py-2 text-sm font-semibold"
                />
                <textarea
                  name="seccion_cuerpo"
                  defaultValue={row.cuerpo}
                  rows={5}
                  placeholder="Texto de la sección..."
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-slate-400">Sin secciones.</p>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleRestaurar}
            disabled={isPending || !personalizada}
            className="px-4 py-2.5 rounded-xl font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40"
          >
            Restaurar contenido original
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Guardando…" : guardado ? "✓ Guardado" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
