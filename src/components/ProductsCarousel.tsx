"use client";
// src/components/ProductsCarousel.tsx

import { useRef, useState } from "react";
import { FiInfo } from "react-icons/fi";
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
  const listRef              = useRef<HTMLUListElement | null>(null);
  const [offset, setOffset]  = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  const step = () => {
    const list = listRef.current;
    if (!list) return 0;
    const card = list.querySelector("li") as HTMLLIElement | null;
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(list).gap || "24");
    return card.getBoundingClientRect().width + gap;
  };

  const next = () => {
    const s = step();
    setOffset(prev => {
      const val = prev + s;
      if (listRef.current) listRef.current.style.transform = `translateX(${-val}px)`;
      return val;
    });
  };

  const prev = () => {
    const s = step();
    setOffset(prev => {
      const val = Math.max(0, prev - s);
      if (listRef.current) listRef.current.style.transform = `translateX(${-val}px)`;
      return val;
    });
  };

  return (
    <section id="productos" className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold">Te va a quedar increíble, lo sé</h2>
          <div className="flex gap-2">
            <button onClick={prev} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50" aria-label="Anterior">‹</button>
            <button onClick={next} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50" aria-label="Siguiente">›</button>
          </div>
        </div>

        <div className="overflow-hidden">
          <ul
            ref={listRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-transform will-change-transform"
          >
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

                <div className="mt-4 flex gap-2">
                  {/* Carrito — usa el mismo componente que la tienda */}
                  <div className="flex-1">
                    <AddToCartInlineButton productId={p.id} />
                  </div>

                  {/* Ver detalle — ruta dinámica según categoría */}
                  <Link
                    href={`/mochilas/${p.id}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold border hover:bg-slate-50"
                  >
                    <FiInfo size={18} />
                  </Link>

                  {/* Favorito */}
                  <button
                    onClick={() =>
                      setFavorites(prev =>
                        prev.includes(p.id)
                          ? prev.filter(id => id !== p.id)
                          : [...prev, p.id]
                      )
                    }
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold border transition
                      ${favorites.includes(p.id) ? "bg-red-500 text-white border-red-500" : "hover:bg-slate-50"}`}
                  >
                    ❤
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}