"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { api, type ProductModel } from "@/lib/api";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCartInlineButton from "@/components/AddToCartInlineButton";

export default function FavoritosPage() {
  const { user } = useAuth();
  const { favoriteIds, hydrate, hydrated } = useFavorites();
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate(!!user);
  }, [user, hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (favoriteIds.length === 0) { setLoading(false); setProducts([]); return; }

    setLoading(true);
    Promise.all(favoriteIds.map(id => api.productById(id).catch(() => null)))
      .then(results => setProducts(results.filter((p): p is ProductModel => p !== null)))
      .finally(() => setLoading(false));
  }, [favoriteIds, hydrated]);

  return (
    <main className="min-h-screen">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Mis Favoritos</h1>
          <p className="text-white/85">Los productos que más te gustan.</p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-colonta-primary border-t-transparent animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <p className="text-xl font-semibold text-slate-700">Aún no tienes favoritos</p>
              <p className="text-slate-500 text-sm max-w-xs">
                Presiona el corazón en cualquier producto para guardarlo aquí.
              </p>
              <Link href="/mochilas" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-colonta-primary text-white px-5 py-2.5 font-semibold hover:opacity-90">
                Ver productos
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => {
                const priceCL = new Intl.NumberFormat("es-CL").format(Number(p.basePrice));
                return (
                  <li key={p.id} className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden flex flex-col">
                    <Link href={`/mochilas/${p.id}`} className="block">
                      <div className="aspect-[4/5] bg-slate-100">
                        <img
                          src={p.imageUrl || "/mochila1.png"}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="p-4 flex flex-col gap-2">
                      <Link href={`/mochilas/${p.id}`}>
                        <p className="font-semibold">{p.name}</p>
                      </Link>
                      {Number(p.basePrice) > 0 && (
                        <p className="font-extrabold">${priceCL}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        <AddToCartInlineButton productId={p.id} />
                        <FavoriteButton productId={p.id} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
