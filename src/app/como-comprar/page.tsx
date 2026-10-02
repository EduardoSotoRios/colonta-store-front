import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PAGINAS_INFO_DEFAULTS } from "@/lib/paginasInfoDefaults";
import PaginaInfoRender, { type SeccionInfo } from "@/components/PaginaInfoRender";

export const dynamic = "force-dynamic";

// Página nueva: a diferencia de garantía/política-compra/preguntas-frecuentes,
// no existía un diseño hardcodeado previo que preservar como respaldo — si
// el admin todavía no guardó nada, mostramos el borrador inicial definido
// en paginasInfoDefaults.ts (editable desde Admin > Mantenimiento).
export default async function ComoComprarPage() {
  let contenido: { titulo: string; subtitulo: string | null; secciones: SeccionInfo[] } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("paginas_contenido")
      .select("titulo,subtitulo,secciones")
      .eq("slug", "como-comprar")
      .maybeSingle();
    contenido = data;
  } catch {
    contenido = null;
  }

  const final = contenido ?? PAGINAS_INFO_DEFAULTS["como-comprar"];
  return <PaginaInfoRender titulo={final.titulo} subtitulo={final.subtitulo} secciones={final.secciones} />;
}
