import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PAGINAS_INFO_DEFAULTS } from "@/lib/paginasInfoDefaults";
import PaginaInfoRender, { type SeccionInfo } from "@/components/PaginaInfoRender";

export const dynamic = "force-dynamic";

// Página nueva (sin diseño hardcodeado previo que preservar) — si el admin
// todavía no guardó nada, se muestra el borrador inicial de
// paginasInfoDefaults.ts, editable desde Admin > Mantenimiento.
export default async function DespachoPage() {
  let contenido: { titulo: string; subtitulo: string | null; secciones: SeccionInfo[] } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("paginas_contenido")
      .select("titulo,subtitulo,secciones")
      .eq("slug", "despacho")
      .maybeSingle();
    contenido = data;
  } catch {
    contenido = null;
  }

  const final = contenido ?? PAGINAS_INFO_DEFAULTS["despacho"];
  return <PaginaInfoRender titulo={final.titulo} subtitulo={final.subtitulo} secciones={final.secciones} />;
}
