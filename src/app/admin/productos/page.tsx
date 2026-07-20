// src/app/admin/productos/page.tsx
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIA_NOMBRES: Record<string, string> = {
  mochilas:   "Mochilas",
  bananos:    "Bananos",
  bolsos:     "Bolsos",
  notebook:   "Porta Notebook",
  accesorios: "Accesorios",
};

type SearchParams = { q?: string; categoria?: string };

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp       = await (searchParams ?? Promise.resolve({} as SearchParams));
  const q        = sp.q?.trim() || undefined;
  const categoria = sp.categoria?.trim() || undefined;

  const supabase = await createSupabaseAdminClient();

  let query = supabase
    .from("productos_completos")
    .select("id, nombre, slug, emoji, precio, peso_g, badge, personalizable, activo, categoria_slug, categoria_nombre, producto_imagenes(url, principal)")
    .order("categoria_id", { ascending: true })
    .order("orden", { ascending: true });

  if (q)         query = query.ilike("nombre", `%${q}%`);
  if (categoria) query = query.eq("categoria_slug", categoria);

  const { data: productos, error } = await query;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {productos?.length ?? 0} productos en total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 transition-opacity"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Filtros */}
      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar producto..."
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-colonta-primary"
        />
        <select
          name="categoria"
          defaultValue={categoria ?? ""}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORIA_NOMBRES).map(([slug, nombre]) => (
            <option key={slug} value={slug}>{nombre}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
        >
          Filtrar
        </button>
        {(q || categoria) && (
          <Link
            href="/admin/productos"
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">
          Error cargando productos: {error.message}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Producto</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Categoría</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Precio</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Peso</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Estado</th>
              <th className="text-right px-4 py-3 text-slate-500 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(productos ?? []).map(p => {
              const imagen = p.producto_imagenes?.find((i: any) => i.principal)?.url
                          ?? p.producto_imagenes?.[0]?.url;
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  {/* Producto */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {imagen
                          ? <img src={imagen} alt={p.nombre} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">{p.emoji}</div>
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{p.nombre}</p>
                        <p className="text-xs text-slate-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  {/* Categoría */}
                  <td className="px-4 py-3 text-slate-600">
                    {CATEGORIA_NOMBRES[p.categoria_slug] ?? p.categoria_slug}
                  </td>
                  {/* Precio */}
                  <td className="px-4 py-3">
                    {p.precio
                      ? <span className="font-semibold">${new Intl.NumberFormat("es-CL").format(Number(p.precio))}</span>
                      : <span className="text-slate-400 text-xs">Sin precio</span>
                    }
                  </td>
                  {/* Peso */}
                  <td className="px-4 py-3 text-slate-600">
                    {p.peso_g ? `${p.peso_g} g` : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  {/* Estado */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          {p.badge}
                        </span>
                      )}
                      {p.personalizable && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
                          Personalizable
                        </span>
                      )}
                      {!p.activo && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/productos/${p.id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        Ver →
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(productos ?? []).length === 0 && !error && (
          <div className="p-12 text-center text-slate-400">
            No hay productos para los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}