"use server";

import { cloudinary } from "@/lib/cloudinary";

// ─── Subir diseño del configurador a Cloudinary ────────────────
export async function subirDisenioPersonalizado(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Diseño inválido");
  }

  const publicId = `colonta/disenos/${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUrl,
      { public_id: publicId, resource_type: "image", overwrite: false },
      (err, res) => { if (err || !res) reject(err); else resolve(res); }
    );
  });

  return cloudinary.url(result.public_id, {
    fetch_format: "auto",
    quality: "auto",
    secure: true,
  });
}
