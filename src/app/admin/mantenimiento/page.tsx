import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PAGINAS_INFO } from "@/lib/paginasInfo";
import { getMantenimientoGlobal } from "./actions";
import MantenimientoGlobalToggle from "./MantenimientoGlobalToggle";

export const dynamic = "force-dynamic";

export default async function MantenimientoPage() {
  let editadas = new Set<string>();
  let mantencionActiva = false;
  let configError: string | null = null;

  try {
    const supabase = await createSupabaseAdminClient();
    const { data } = await supabase.from("paginas_contenido").select("slug");
    editadas = new Set((data ?? []).map((r) => r.slug));
    mantencionActiva = await getMantenimientoGlobal();
  } catch (e: any) {
    configError = e?.message ?? "Error de configuración del servidor.";
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Mantenimiento</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Edita el contenido de páginas informativas del sitio (garantía, términos, etc).
        </p>
      </div>

      {configError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">
          Error de configuración: {configError}
        </div>
      )}

      <MantenimientoGlobalToggle activoInicial={mantencionActiva} />

      <div className="space-y-3">
        {PAGINAS_INFO.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/mantenimiento/${p.slug}`}
            className="flex items-center justify-between gap-4 bg-white rounded-2xl ring-1 ring-black/5 p-5 hover:ring-colonta-primary/40 transition-shadow"
          >
            <div>
              <p className="font-semibold text-slate-800">{p.nombre}</p>
              <p className="text-xs text-slate-400 mt-0.5">{p.ruta}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
              editadas.has(p.slug) ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
            }`}>
              {editadas.has(p.slug) ? "Personalizada" : "Contenido original"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
