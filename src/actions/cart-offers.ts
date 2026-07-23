"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CartOffer = {
  id: number;
  umbral_minimo: number;
  precio_oferta: number;
  producto: {
    id: string;
    nombre: string;
    precio_normal: number;
    imagen_url: string | null;
  };
};

export async function getCartOffers(): Promise<CartOffer[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: offers, error } = await supabase
      .from("cart_offers")
      .select("*")
      .eq("activo", true)
      .order("orden");

    if (error || !offers?.length) return [];

    const slugs = offers.map((o: any) => o.producto_slug);
    const { data: productos } = await supabase
      .from("productos_completos")
      .select("id,nombre,precio,slug,producto_imagenes(url,principal,orden)")
      .in("slug", slugs);

    const productosMap = new Map(
      (productos ?? []).map((p: any) => [p.slug, p])
    );

    return offers
      .map((offer: any) => {
        const p: any = productosMap.get(offer.producto_slug);
        if (!p) return null;
        const imgs: any[] = p.producto_imagenes ?? [];
        const principal =
          imgs.find((i) => i.principal) ??
          imgs.sort((a, b) => a.orden - b.orden)[0];
        return {
          id: offer.id,
          umbral_minimo: offer.umbral_minimo,
          precio_oferta: offer.precio_oferta,
          producto: {
            id: p.id,
            nombre: p.nombre,
            precio_normal: p.precio,
            imagen_url: principal?.url ?? null,
          },
        };
      })
      .filter(Boolean) as CartOffer[];
  } catch {
    return [];
  }
}
