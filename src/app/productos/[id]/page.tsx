import { notFound } from "next/navigation";
import { api, type ProductModel } from "@/lib/api";
import ProductDetailClient from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORIA_NOMBRES: Record<string, string> = {
  mochilas:   "Mochilas",
  bananos:    "Bananos",
  bolsos:     "Bolsos",
  notebook:   "Porta Notebook",
  accesorios: "Accesorios",
};

const CATEGORIA_RUTAS: Record<string, string> = {
  mochilas:   "/mochilas",
  bananos:    "/mochilas",
  bolsos:     "/mochilas",
  notebook:   "/mochilas",
  accesorios: "/mochilas",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await api.getProductoById(id);
    if (!product) return { title: "Producto no encontrado" };
    return {
      title: `${product.name} | Colonta`,
      description: product.tagline ?? `Compra ${product.name} de Colonta. Envíos a todo Chile.`,
      openGraph: { title: `${product.name} | Colonta`, images: [product.imageUrl || ""] },
    };
  } catch {
    return { title: "Producto no encontrado" };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product: ProductModel | null = null;
  try {
    product = await api.getProductoById(id);
  } catch {
    product = null;
  }
  if (!product) return notFound();

  const categoriaRuta   = CATEGORIA_RUTAS[product.category]  ?? "/mochilas";
  const categoriaNombre = CATEGORIA_NOMBRES[product.category] ?? product.category;

  return (
    <main className="min-h-screen">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <a href={categoriaRuta} className="text-white/80 hover:text-white">
            &larr; Volver a {categoriaNombre}
          </a>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">{product.name}</h1>
          <p className="mt-1 text-white/85 capitalize">{categoriaNombre}</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductDetailClient
            product={product}
            imagenes={product.imagenes ?? []}
          />
        </div>
      </section>
    </main>
  );
}
