// src/app/mochilas/page.tsx
import Link from "next/link";
import { api, type ProductModel } from "@/lib/api";
import AddToCartInlineButton from "@/components/AddToCartInlineButton";
import FavoriteButton from "@/components/FavoriteButton";
import PriceFilter from "@/components/PriceFilter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORIA_NOMBRES: Record<string, string> = {
  mochilas:   "Mochilas",
  bananos:    "Bananos",
  bolsos:     "Bolsos",
  notebook:   "Porta Notebook",
  accesorios: "Accesorios",
};

const CATEGORIAS_ORDEN = ["mochilas", "bananos", "bolsos", "notebook", "accesorios"];

// Nombres legibles en el orden correcto — siempre fijos, no dependen de los productos
const CATEGORIAS_PARA_FILTRO = CATEGORIAS_ORDEN.map(slug => CATEGORIA_NOMBRES[slug]);

const NOMBRE_A_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORIA_NOMBRES).map(([slug, nombre]) => [nombre.toLowerCase(), slug])
);

type SearchParams = { min?: string; max?: string; q?: string; category?: string; sort?: string; oferta?: string };

export default async function MochilasPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp     = await (searchParams ?? Promise.resolve({} as SearchParams));
  const min    = Number.isFinite(Number(sp.min)) ? Number(sp.min) : undefined;
  const max    = Number.isFinite(Number(sp.max)) ? Number(sp.max) : undefined;
  const q      = sp.q?.trim() || undefined;
  const sort   = (sp.sort as "price_asc" | "price_desc" | undefined) ?? undefined;
  const oferta = sp.oferta === "1";

  // Normalizar category a slug
  const categoryRaw = sp.category?.trim() || undefined;
  const category    = categoryRaw
    ? (NOMBRE_A_SLUG[categoryRaw.toLowerCase()] ?? categoryRaw.toLowerCase())
    : undefined;

  let products: ProductModel[] = [];
  try {
    products = await api.getTodosLosProductos({
      limit: 9999,
      q,
      minPrice: min,
      maxPrice: max,
      category,
      sort,
    });
  } catch (error) {
    console.error("Error loading productos:", error);
  }

  // Rango de precios
  const prices   = products.map(p => Number(p.basePrice)).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 100000;

  // Filtros en memoria (fallback)
  if (typeof min === "number") products = products.filter(p => Number(p.basePrice) >= min);
  if (typeof max === "number") products = products.filter(p => Number(p.basePrice) <= max);
  if (q) {
    const qq = q.toLowerCase();
    products = products.filter(
      p => p.name.toLowerCase().includes(qq) || p.category.toLowerCase().includes(qq)
    );
  }
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category);
  }
  if (sort === "price_asc")  products = [...products].sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
  if (sort === "price_desc") products = [...products].sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
  if (oferta) products = products.filter(p => p.precioOferta != null && p.precioOferta > 0);

  const hayFiltro = q || category || typeof min === "number" || typeof max === "number" || oferta;

  return (
    <main className="min-h-screen">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Tienda Colonta</h1>
          <p className="text-white/85">Mochilas, bananos, bolsos y accesorios hechos a mano.</p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <PriceFilter
            categories={CATEGORIAS_PARA_FILTRO}
            minPrice={minPrice}
            maxPrice={maxPrice}
            oferta={oferta}
          />

          {products.length === 0 && (
            <div className="rounded-xl border p-6 bg-white">
              <p>No hay productos para los filtros seleccionados.</p>
            </div>
          )}

          {hayFiltro && products.length > 0 && (
            <ProductGrid products={products} />
          )}

          {!hayFiltro && CATEGORIAS_ORDEN.map(slug => {
            const grupo = products.filter(p => p.category === slug);
            if (grupo.length === 0) return null;
            return (
              <div key={slug}>
                <h2 className="text-xl font-bold mb-4">
                  {CATEGORIA_NOMBRES[slug]}
                </h2>
                <ProductGrid products={grupo} />
              </div>
            );
          })}

        </div>
      </section>
    </main>
  );
}

function ProductGrid({ products }: { products: ProductModel[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(p => {
        const priceCL     = new Intl.NumberFormat("es-CL").format(Number(p.basePrice));
        const salePriceCL = p.precioOferta ? new Intl.NumberFormat("es-CL").format(p.precioOferta) : null;
        return (
          <li
            key={p.id}
            className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden flex flex-col"
          >
            <Link href={`/mochilas/${p.id}`} className="block relative">
              <div className="aspect-[4/5] bg-slate-100">
                <img
                  src={p.imageUrl || "/mochila1.png"}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {salePriceCL && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  OFERTA
                </span>
              )}
            </Link>

            <div className="p-4 flex flex-col gap-2">
              <Link href={`/mochilas/${p.id}`}>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-slate-600 capitalize">
                  {CATEGORIA_NOMBRES[p.category] ?? p.category}
                </p>
              </Link>

              {Number(p.basePrice) > 0 && (
                salePriceCL ? (
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="font-extrabold text-red-600">${salePriceCL}</p>
                    <p className="text-sm text-slate-400 line-through">${priceCL}</p>
                  </div>
                ) : (
                  <p className="mt-1 font-extrabold">${priceCL}</p>
                )
              )}

              <div className="flex gap-2">
                <AddToCartInlineButton
                  productId={p.id}
                  productName={p.name}
                  unitPrice={p.precioOferta ?? Number(p.basePrice)}
                  imageUrl={p.imageUrl ?? undefined}
                />
                <FavoriteButton productId={p.id} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}