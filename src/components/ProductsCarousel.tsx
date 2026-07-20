"use client";
// src/components/ProductsCarousel.tsx

import Link from "next/link";
import AddToCartInlineButton from "@/components/AddToCartInlineButton";

type Product = {
  id:            string;
  name:          string;
  price:         string;
  imageUrl:      string | null;
  categoriaSlug: string;
};

export default function ProductsCarousel({ products }: { products: Product[] }) {
  return (
    <section id="productos" className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold">Te va a quedar increíble, lo sé</h2>
        </div>

        <div className="overflow-hidden">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <li key={p.id} className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 p-4 flex flex-col">
                <Link href={`/mochilas/${p.id}`} className="block">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100">
                    <img
                      className="w-full h-full object-cover"
                      src={p.imageUrl || "/mochila1.png"}
                      alt={p.name}
                    />
                  </div>
                </Link>

                <h3 className="mt-4 font-semibold">{p.name}</h3>
                {p.price && <p className="text-sm text-slate-600">{p.price}</p>}

                <div className="mt-4">
                  {/* Carrito — usa el mismo componente que la tienda */}
                  <AddToCartInlineButton productId={p.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}