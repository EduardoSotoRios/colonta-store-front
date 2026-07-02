// src/components/ProductsSection.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductsCarousel from "./ProductsCarousel";

export default async function ProductsSection() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("productos_completos")
    .select("id, nombre, precio, badge, categoria_slug, producto_imagenes(*)")
    .order("orden", { ascending: true })
    .limit(8);

  if (error || !data) return null;

  const productos = data.map((p: any) => ({
    id:            p.id,
    name:          p.nombre,
    price:         p.precio ? `$${new Intl.NumberFormat("es-CL").format(Number(p.precio))}` : "",
    imageUrl:      p.producto_imagenes?.find((i: any) => i.principal)?.url
                   ?? p.producto_imagenes?.[0]?.url
                   ?? null,
    categoriaSlug: p.categoria_slug ?? "mochilas",
  }));

  return <ProductsCarousel products={productos} />;
}