import Link from "next/link";
import { notFound } from "next/navigation";
import { PAGINAS_INFO, type PaginaInfoSlug } from "@/lib/paginasInfo";
import { PAGINAS_INFO_DEFAULTS } from "@/lib/paginasInfoDefaults";
import { getPaginaContenido } from "../actions";
import MantenimientoEditor from "./MantenimientoEditor";

export const dynamic = "force-dynamic";

export default async function EditarPaginaInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pagina = PAGINAS_INFO.find((p) => p.slug === slug);
  if (!pagina) notFound();

  let contenidoGuardado = null;
  let configError: string | null = null;
  try {
    contenidoGuardado = await getPaginaContenido(slug as PaginaInfoSlug);
  } catch (e: any) {
    configError = e?.message ?? "Error de configuración del servidor.";
  }

  // Si el admin nunca guardó nada para esta página, precargamos el editor
  // con el texto que hoy se ve en vivo (para que pueda partir editando eso
  // en vez de un formulario vacío). "personalizada" indica si lo que se ve
  // abajo es contenido real guardado en la base, o solo el de referencia.
  const personalizada = contenidoGuardado !== null;
  const contenido = contenidoGuardado ?? PAGINAS_INFO_DEFAULTS[slug as PaginaInfoSlug];

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/mantenimiento" className="text-sm text-slate-500 hover:text-colonta-primary">
          ← Mantenimiento
        </Link>
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-extrabold">{pagina.nombre}</h1>
          <a
            href={pagina.ruta}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-colonta-primary hover:underline font-semibold"
          >
            Ver página ↗
          </a>
        </div>
      </div>

      {configError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">
          Error de configuración: {configError}
        </div>
      )}

      <MantenimientoEditor slug={pagina.slug} contenido={contenido} personalizada={personalizada} />
    </div>
  );
}
