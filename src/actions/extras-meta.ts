"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function subirImagenExtra(extraId: string, formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file || !file.size) throw new Error("No se seleccionó archivo");

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { public_id: `colonta/extras/${extraId}`, resource_type: "image", overwrite: true },
      (err, res) => { if (err || !res) reject(err); else resolve(res); }
    ).end(buffer);
  });

  const imageUrl = cloudinary.url(result.public_id, {
    fetch_format: "auto",
    quality: "auto",
    secure: true,
  });

  const supabase = await createSupabaseAdminClient();
  await supabase
    .from("extras_meta")
    .upsert({ extra_id: extraId, image_url: imageUrl, updated_at: new Date().toISOString() });

  return imageUrl;
}

export async function getExtrasMeta(): Promise<Record<string, string>> {
  const supabase = await createSupabaseAdminClient();
  const { data } = await supabase.from("extras_meta").select("extra_id, image_url");
  const map: Record<string, string> = {};
  data?.forEach((row) => { map[row.extra_id] = row.image_url; });
  return map;
}

export async function sincronizarExtra(extra: {
  id: string;
  name: string;
  description: string;
  price: number;
}): Promise<void> {
  const supabase = await createSupabaseAdminClient();
  await supabase.from("extras").upsert({
    id:          extra.id,
    name:        extra.name,
    description: extra.description,
    price:       extra.price,
    updated_at:  new Date().toISOString(),
  });
}

export async function eliminarExtraMeta(extraId: string): Promise<void> {
  const supabase = await createSupabaseAdminClient();
  await Promise.all([
    supabase.from("extras").delete().eq("id", extraId),
    supabase.from("extras_meta").delete().eq("extra_id", extraId),
    supabase.from("producto_extras").delete().eq("extra_id", extraId),
  ]);
}
