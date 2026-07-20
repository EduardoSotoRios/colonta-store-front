// src/components/ProductsSection.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductsCarousel from "./ProductsCarousel";

const IMG_SELECT = "id,url,alt,principal,orden";
const PROD_SELECT = `id,nombre,precio,badge,orden,categoria_slug, producto_imagenes(${IMG_SELECT})`;

export default async function ProductsSection() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("productos_completos")
    .select(PROD_SELECT)
    .eq("activo", true)
    .order("orden", { ascending: true })
    .limit(8);

  if (error || !data) return null;

  function safeUrl(url: string | null | undefined): string | null {
    if (!url || /^https?:\/\/localhost/i.test(url)) return null;
    return url;
  }

  const productos = data.map((p: any) => {
    const imgs: any[] = p.producto_imagenes ?? [];
    const sorted = [...imgs].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const principal = sorted.find((i: any) => i.principal);
    return {
      id:            p.id,
      name:          p.nombre,
      price:         p.precio ? `$${new Intl.NumberFormat("es-CL").format(Number(p.precio))}` : "",
      imageUrl:      safeUrl(principal?.url) ?? safeUrl(sorted[0]?.url) ?? null,
      categoriaSlug: p.categoria_slug ?? "mochilas",
    };
  });

  return <ProductsCarousel products={productos} />;
}