// src/app/admin/productos/actions.ts
"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ─── Crear producto ────────────────────────────────────────────
export async function crearProducto(formData: FormData) {
  const supabase = await createSupabaseAdminClient();

  const categoria_slug = formData.get("categoria_slug") as string;

  // Obtener ID de categoría
  const { data: cat } = await supabase
    .from("categorias")
    .select("id")
    .eq("slug", categoria_slug)
    .single();

  if (!cat) throw new Error("Categoría no encontrada");

  const { data: producto, error } = await supabase
    .from("productos")
    .insert({
      categoria_id:   cat.id,
      nombre:         formData.get("nombre") as string,
      slug:           (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
      emoji:          formData.get("emoji") as string || null,
      tagline:        formData.get("tagline") as string || null,
      descripcion:    formData.get("descripcion") as string || null,
      precio:         formData.get("precio") ? Number(formData.get("precio")) : null,
      peso_g:         formData.get("peso_g") ? Number(formData.get("peso_g")) : null,
      badge:          formData.get("badge") as string || null,
      personalizable: formData.get("personalizable") === "true",
      activo:         true,
      orden:          Number(formData.get("orden") ?? 99),
    })
    .select("id")
    .single();

  if (error) throw new Error(`Error creando producto: ${error.message}`);

  // Specs
  const specsJson = formData.get("specs") as string;
  if (specsJson) {
    const specs = JSON.parse(specsJson);
    if (specs.length > 0) {
      await supabase.from("producto_specs").insert(
        specs.map((s: any, i: number) => ({ ...s, producto_id: producto.id, orden: i + 1 }))
      );
    }
  }

  // Características
  const caracJson = formData.get("caracteristicas") as string;
  if (caracJson) {
    const caracs = JSON.parse(caracJson);
    if (caracs.length > 0) {
      await supabase.from("producto_caracteristicas").insert(
        caracs.map((texto: string, i: number) => ({ texto, producto_id: producto.id, orden: i + 1 }))
      );
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/mochilas");
  redirect(`/admin/productos/${producto.id}`);
}

// ─── Actualizar producto ───────────────────────────────────────
export async function actualizarProducto(id: string, formData: FormData) {
  const supabase = await createSupabaseAdminClient();

  const categoria_slug = formData.get("categoria_slug") as string;
  const { data: cat } = await supabase
    .from("categorias")
    .select("id")
    .eq("slug", categoria_slug)
    .single();

  if (!cat) throw new Error("Categoría no encontrada");

  const { error } = await supabase
    .from("productos")
    .update({
      categoria_id:   cat.id,
      nombre:         formData.get("nombre") as string,
      slug:           (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-"),
      emoji:          formData.get("emoji") as string || null,
      tagline:        formData.get("tagline") as string || null,
      descripcion:    formData.get("descripcion") as string || null,
      precio:         formData.get("precio") ? Number(formData.get("precio")) : null,
      peso_g:         formData.get("peso_g") ? Number(formData.get("peso_g")) : null,
      badge:          formData.get("badge") as string || null,
      personalizable: formData.get("personalizable") === "true",
      activo:         formData.get("activo") === "true",
      orden:          Number(formData.get("orden") ?? 99),
    })
    .eq("id", id);

  if (error) throw new Error(`Error actualizando producto: ${error.message}`);

  // Reemplazar specs
  await supabase.from("producto_specs").delete().eq("producto_id", id);
  const specsJson = formData.get("specs") as string;
  if (specsJson) {
    const specs = JSON.parse(specsJson);
    if (specs.length > 0) {
      await supabase.from("producto_specs").insert(
        specs.map((s: any, i: number) => ({ ...s, producto_id: id, orden: i + 1 }))
      );
    }
  }

  // Reemplazar características
  await supabase.from("producto_caracteristicas").delete().eq("producto_id", id);
  const caracJson = formData.get("caracteristicas") as string;
  if (caracJson) {
    const caracs = JSON.parse(caracJson);
    if (caracs.length > 0) {
      await supabase.from("producto_caracteristicas").insert(
        caracs.map((texto: string, i: number) => ({ texto, producto_id: id, orden: i + 1 }))
      );
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  revalidatePath("/mochilas");
}

// ─── Eliminar producto ─────────────────────────────────────────
export async function eliminarProducto(id: string) {
  const supabase = await createSupabaseAdminClient();

  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(`Error eliminando producto: ${error.message}`);

  revalidatePath("/admin/productos");
  revalidatePath("/mochilas");
  redirect("/admin/productos");
}

// ─── Agregar imagen ────────────────────────────────────────────
export async function agregarImagen(productoId: string, formData: FormData) {
  const supabase = await createSupabaseAdminClient();

  const url       = formData.get("url") as string;
  const alt       = formData.get("alt") as string || null;
  const principal = formData.get("principal") === "true";

  const toColorId = (key: string) => {
    const v = formData.get(key) as string;
    return v ? parseInt(v) : null;
  };

  if (principal) {
    await supabase
      .from("producto_imagenes")
      .update({ principal: false })
      .eq("producto_id", productoId);
  }

  const { data: existentes } = await supabase
    .from("producto_imagenes")
    .select("orden")
    .eq("producto_id", productoId)
    .order("orden", { ascending: false })
    .limit(1);

  const orden = existentes?.[0]?.orden ? existentes[0].orden + 1 : 1;

  const { error } = await supabase.from("producto_imagenes").insert({
    producto_id:       productoId,
    url, alt, principal, orden,
    color:             toColorId("color"),
    color_secundario:  toColorId("color_secundario"),
    color_terciario:   toColorId("color_terciario"),
    color_cuaternario: toColorId("color_cuaternario"),
  });

  if (error) throw new Error(`Error agregando imagen: ${error.message}`);
  revalidatePath(`/admin/productos/${productoId}`);
}

// ─── Actualizar colores de imagen ──────────────────────────────
export async function actualizarColoresImagen(
  imagenId: number,
  productoId: string,
  formData: FormData
) {
  const supabase = await createSupabaseAdminClient();

  const toColorId = (key: string) => {
    const v = formData.get(key) as string;
    return v ? parseInt(v) : null;
  };

  const { error } = await supabase
    .from("producto_imagenes")
    .update({
      color:             toColorId("color"),
      color_secundario:  toColorId("color_secundario"),
      color_terciario:   toColorId("color_terciario"),
      color_cuaternario: toColorId("color_cuaternario"),
    })
    .eq("id", imagenId);

  if (error) throw new Error(`Error actualizando colores: ${error.message}`);
  revalidatePath(`/admin/productos/${productoId}`);
}

// ─── Eliminar imagen ───────────────────────────────────────────
export async function eliminarImagen(imagenId: number, productoId: string) {
  const supabase = await createSupabaseAdminClient();

  const { error } = await supabase
    .from("producto_imagenes")
    .delete()
    .eq("id", imagenId);

  if (error) throw new Error(`Error eliminando imagen: ${error.message}`);

  revalidatePath(`/admin/productos/${productoId}`);
}

// ─── Subir imagen a Cloudinary ────────────────────────────────
export async function subirImagenStorage(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file || !file.size) throw new Error("No se seleccionó archivo");

  const buffer    = Buffer.from(await file.arrayBuffer());
  const publicId  = `colonta/productos/${Date.now()}-${Math.random().toString(36).slice(2)}`;

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

// ─── Marcar imagen como principal ─────────────────────────────
export async function marcarImagenPrincipal(imagenId: number, productoId: string) {
  const supabase = await createSupabaseAdminClient();

  // Desmarcar todas
  await supabase
    .from("producto_imagenes")
    .update({ principal: false })
    .eq("producto_id", productoId);

  // Marcar la seleccionada
  const { error } = await supabase
    .from("producto_imagenes")
    .update({ principal: true })
    .eq("id", imagenId);

  if (error) throw new Error(`Error: ${error.message}`);

  revalidatePath(`/admin/productos/${productoId}`);
}