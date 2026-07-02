// src/components/ProductsSection.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductsCarousel from "./ProductsCarousel";

export default async function ProductsSection() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, precio, badge, orden, categorias!categoria_id(slug), producto_imagenes(url, principal, orden)")
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
    const principal = sorted.find((i) => i.principal);
    return {
      id:            p.id,
      name:          p.nombre,
      price:         p.precio ? `$${new Intl.NumberFormat("es-CL").format(Number(p.precio))}` : "",
      imageUrl:      safeUrl(principal?.url) ?? safeUrl(sorted[0]?.url) ?? null,
      categoriaSlug: (p.categorias as any)?.slug ?? "mochilas",
    };
  });

  return <ProductsCarousel products={productos} />;
}