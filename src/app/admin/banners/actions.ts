"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function subirImagenBanner(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file || !file.size) throw new Error("No se seleccionó archivo");

  const buffer   = Buffer.from(await file.arrayBuffer());
  const publicId = `colonta/banners/${Date.now()}-${Math.random().toString(36).slice(2)}`;

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

export async function crearBanner(formData: FormData) {
  const supabase = await createSupabaseAdminClient();
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
  const supabase = await createSupabaseAdminClient();
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
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("banners").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function eliminarBanner(id: number) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
