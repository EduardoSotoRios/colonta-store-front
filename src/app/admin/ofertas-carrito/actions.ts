"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CartOfferAdmin = {
  id: number;
  umbral_minimo: number;
  producto_slug: string;
  precio_oferta: number;
  activo: boolean;
  orden: number;
  producto_nombre: string | null;
};

export async function getCartOffersAdmin(): Promise<CartOfferAdmin[]> {
  const supabase = await createSupabaseAdminClient();

  const { data: offers, error } = await supabase
    .from("cart_offers")
    .select("*")
    .order("orden");

  if (error) throw new Error(error.message);
  if (!offers?.length) return [];

  const slugs = offers.map((o: any) => o.producto_slug);
  const { data: productos } = await supabase
    .from("productos_completos")
    .select("slug,nombre")
    .in("slug", slugs);

  const nombresMap = new Map((productos ?? []).map((p: any) => [p.slug, p.nombre]));

  return offers.map((o: any) => ({
    id: o.id,
    umbral_minimo: o.umbral_minimo,
    producto_slug: o.producto_slug,
    precio_oferta: o.precio_oferta,
    activo: o.activo,
    orden: o.orden,
    producto_nombre: nombresMap.get(o.producto_slug) ?? null,
  }));
}

export async function getProductosSlugs(): Promise<{ slug: string; nombre: string }[]> {
  const supabase = await createSupabaseAdminClient();
  const { data } = await supabase
    .from("productos_completos")
    .select("slug,nombre")
    .order("nombre");
  return (data ?? []).map((p: any) => ({ slug: p.slug, nombre: p.nombre }));
}

export async function crearOfertaCarrito(formData: FormData) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("cart_offers").insert({
    umbral_minimo: Number(formData.get("umbral_minimo")),
    producto_slug: (formData.get("producto_slug") as string).trim(),
    precio_oferta: Number(formData.get("precio_oferta")),
    orden:         Number(formData.get("orden") ?? 0),
    activo:        true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ofertas-carrito");
}

export async function actualizarOfertaCarrito(id: number, formData: FormData) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("cart_offers").update({
    umbral_minimo: Number(formData.get("umbral_minimo")),
    producto_slug: (formData.get("producto_slug") as string).trim(),
    precio_oferta: Number(formData.get("precio_oferta")),
    orden:         Number(formData.get("orden") ?? 0),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ofertas-carrito");
}

export async function toggleOfertaCarrito(id: number, activo: boolean) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("cart_offers").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ofertas-carrito");
}

export async function eliminarOfertaCarrito(id: number) {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("cart_offers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ofertas-carrito");
}
