"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PAGINAS_INFO, type PaginaInfoSlug } from "@/lib/paginasInfo";
import { cloudinary } from "@/lib/cloudinary";

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

type BloqueGuardado =
  | { tipo: "texto"; titulo: string; cuerpo: string }
  | { tipo: "imagen"; titulo: string; url: string };

// Cada bloque (sección de texto o imagen) llega como un ítem más en 4
// arrays paralelos del mismo FormData (uno por nombre, uno por bloque,
// en el mismo orden) — el editor siempre manda los 4 campos por bloque,
// aunque algunos queden vacíos, para que los índices no se desalineen.
function leerSecciones(formData: FormData): BloqueGuardado[] {
  const tipos = formData.getAll("seccion_tipo") as string[];
  const titulos = formData.getAll("seccion_titulo") as string[];
  const cuerpos = formData.getAll("seccion_cuerpo") as string[];
  const urls = formData.getAll("seccion_url") as string[];
  return tipos
    .map((tipoCrudo, i): BloqueGuardado => {
      const titulo = (titulos[i] ?? "").trim();
      if (tipoCrudo === "imagen") {
        return { tipo: "imagen", titulo, url: (urls[i] ?? "").trim() };
      }
      return { tipo: "texto", titulo, cuerpo: (cuerpos[i] ?? "").trim() };
    })
    .filter((s) => (s.tipo === "imagen" ? !!s.url : s.titulo || s.cuerpo));
}

// Sube la imagen de un bloque a Cloudinary (mismo patrón que banners/
// productos) y devuelve la URL final para guardarla en la sección.
export async function subirImagenSeccion(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file || !file.size) throw new Error("No se seleccionó archivo");

  const buffer = Buffer.from(await file.arrayBuffer());
  const publicId = `colonta/paginas/${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: "image", overwrite: false },
      (err, res) => { if (err || !res) reject(err); else resolve(res); }
    ).end(buffer);
  });

  return cloudinary.url(result.public_id, {
    fetch_format: "auto",
    quality: "auto",
    secure: true,
  });
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
