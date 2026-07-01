"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearBanner(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").insert({
    url:        formData.get("url") as string,
    titulo:     (formData.get("titulo") as string)    || null,
    subtitulo:  (formData.get("subtitulo") as string) || null,
    cta_texto:  (formData.get("cta_texto") as string) || null,
    cta_href:   (formData.get("cta_href") as string)  || null,
    cta2_texto: (formData.get("cta2_texto") as string)|| null,
    cta2_href:  (formData.get("cta2_href") as string) || null,
    orden:      Number(formData.get("orden") ?? 99),
    activo:     true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function actualizarBanner(id: number, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").update({
    url:        formData.get("url") as string,
    titulo:     (formData.get("titulo") as string)    || null,
    subtitulo:  (formData.get("subtitulo") as string) || null,
    cta_texto:  (formData.get("cta_texto") as string) || null,
    cta_href:   (formData.get("cta_href") as string)  || null,
    cta2_texto: (formData.get("cta2_texto") as string)|| null,
    cta2_href:  (formData.get("cta2_href") as string) || null,
    orden:      Number(formData.get("orden") ?? 99),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBanner(id: number, activo: boolean) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function eliminarBanner(id: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
