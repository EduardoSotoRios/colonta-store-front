"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Los botones vienen del form como pares de inputs con el mismo name
// (boton_texto / boton_href, uno por fila) — FormData.getAll conserva el
// orden en que aparecen en el DOM, así que basta con "ziparlos".
function leerBotones(formData: FormData): { texto: string; href: string }[] {
  const textos = formData.getAll("boton_texto") as string[];
  const hrefs  = formData.getAll("boton_href") as string[];
  return textos
    .map((texto, i) => ({ texto: texto.trim(), href: (hrefs[i] ?? "").trim() }))
    .filter((b) => b.texto && b.href);
}

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
    url:       formData.get("url") as string,
    titulo:    (formData.get("titulo") as string)    || null,
    subtitulo: (formData.get("subtitulo") as string) || null,
    botones:   leerBotones(formData),
    orden:     Number(formData.get("orden") ?? 99),
    activo:    true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function actualizarBanner(id: number, formData: FormData) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("banners").update({
    url:       formData.get("url") as string,
    titulo:    (formData.get("titulo") as string)    || null,
    subtitulo: (formData.get("subtitulo") as string) || null,
    botones:   leerBotones(formData),
    orden:     Number(formData.get("orden") ?? 99),
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
