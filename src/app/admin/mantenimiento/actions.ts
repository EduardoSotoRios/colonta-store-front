"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PAGINAS_INFO, type PaginaInfoSlug } from "@/lib/paginasInfo";

function rutaDe(slug: string): string {
  return PAGINAS_INFO.find((p) => p.slug === slug)?.ruta ?? "/";
}

export async function getPaginaContenido(slug: PaginaInfoSlug) {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("paginas_contenido")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// Las secciones vienen del form como pares de inputs con el mismo name
// (seccion_titulo / seccion_cuerpo, uno por bloque) — igual que los
// botones del editor de banners.
function leerSecciones(formData: FormData): { titulo: string; cuerpo: string }[] {
  const titulos = formData.getAll("seccion_titulo") as string[];
  const cuerpos = formData.getAll("seccion_cuerpo") as string[];
  return titulos
    .map((titulo, i) => ({ titulo: titulo.trim(), cuerpo: (cuerpos[i] ?? "").trim() }))
    .filter((s) => s.titulo || s.cuerpo);
}

export async function guardarPaginaContenido(slug: PaginaInfoSlug, formData: FormData) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("paginas_contenido").upsert({
    slug,
    titulo:    (formData.get("titulo") as string)?.trim() || slug,
    subtitulo: (formData.get("subtitulo") as string)?.trim() || null,
    secciones: leerSecciones(formData),
    actualizado_en: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mantenimiento");
  revalidatePath(`/admin/mantenimiento/${slug}`);
  revalidatePath(rutaDe(slug));
}

export async function restaurarPaginaContenido(slug: PaginaInfoSlug) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("paginas_contenido").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mantenimiento");
  revalidatePath(`/admin/mantenimiento/${slug}`);
  revalidatePath(rutaDe(slug));
}

// Mantención global del sitio: bloquea todas las páginas públicas para
// cualquier visitante salvo el propio admin (ver middleware.ts — /admin y
// /login quedan siempre afuera del bloqueo, pase lo que pase acá).
export async function getMantenimientoGlobal(): Promise<boolean> {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("mantenimiento")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.mantenimiento === true;
}

export async function setMantenimientoGlobal(activo: boolean) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, mantenimiento: activo, actualizado_en: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mantenimiento");
}
