"use client";
import { useRef, useState } from "react";
import type { Product } from "@/types";
import { FiInfo } from "react-icons/fi";
import Link from "next/link";

const products: Product[] = [
  { id: "1", name: "Roll Top Tote", price: "$35.000", imageUrl: "/Producto/mochila - (1).png" },
  { id: "2", name: "Ligera", price: "$19.000", imageUrl: "/Producto/mochila - (15).png" },
  { id: "3", name: "Mini Mochila", price: "$25.000", imageUrl: "/Producto/mochila - (3).png" },
  { id: "4", name: "Arcoíris", price: "$30.000", imageUrl: "/Producto/mochila - (2).png" },
];

export default function Products() {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [infoSelected, setInfoSelected] = useState<string | null>(null);

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
    setOffset((prev) => {
      const val = prev + s;
      if (listRef.current) listRef.current.style.transform = `translateX(${-val}px)`;
      return val;
    });
  };

  const prev = () => {
    const s = step();
    setOffset((prev) => {
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
          <ul ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-transform will-change-transform">
            {products.map((p) => (
              <li key={p.id} className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 p-4 flex flex-col">
                <div className="aspect-[4/5] overflow-hidden rounded-xl">
                  <img className="w-full h-full object-cover" src={p.imageUrl} alt={p.name} />
                </div>
                <h3 className="mt-4 font-semibold">{p.name}</h3>
                <p className="text-sm text-slate-600">{p.price}</p>
                <div className="mt-4 flex gap-2">
                  <a href="#" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-white hover:opacity-90 flex-1" style={{ backgroundColor: "var(--colonta-primary)" }}>
                    Comprar ahora
                  </a>
                  <Link
  href={`/mochilas/${p.id}`}
  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold border hover:bg-slate-50"
>
  <FiInfo size={18} />
</Link>
                  <button
                    onClick={() => {
                      setFavorites((prev) =>
                        prev.includes(p.id)
                          ? prev.filter((id) => id !== p.id) // quitar si ya está
                          : [...prev, p.id] // agregar si no está
                      );
                    }}
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold border transition
                      ${
                        favorites.includes(p.id)
                          ? "bg-red-500 text-white border-red-500"
                          : "hover:bg-slate-50"
                      }
                    `}
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