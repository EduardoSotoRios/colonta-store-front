"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  slug: string;
  variants: { sku: string; color: string; stock: number }[];
};

export default function ProductGridClient() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  useEffect(() => {
    fetch("/colonta-mock-api/products/index.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const data = json.data as Product[];
        setProducts(data);
        const prices = data.map((p) => p.price);
        const pmin = Math.min(...prices);
        const pmax = Math.max(...prices);
        setMin(pmin);
        setMax(pmax);
        setFrom(pmin);
        setTo(pmax);
      })
      .catch((e) => setError(e.message ?? "No se pudieron cargar los productos"));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => p.price >= from && p.price <= to);
  }, [products, from, to]);

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">Error: {error}</div>;
  }

  if (!products) {
    return (
      <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-4 animate-pulse">
            <div className="aspect-[4/5] rounded-xl bg-slate-200" />
            <div className="mt-4 h-4 w-2/3 bg-slate-200 rounded" />
            <div className="mt-2 h-3 w-1/3 bg-slate-200 rounded" />
            <div className="mt-4 h-10 w-full bg-slate-200 rounded-xl" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filtered.length}</span> de {products.length} productos
          </p>
        </div>

        <div className="w-full md:max-w-lg">
          <label className="text-sm font-semibold">Precio</label>
          <div className="mt-2">
            <div className="relative h-2 rounded-full bg-slate-200">
              <div
                className="absolute h-2 rounded-full bg-colonta-primary"
                style={{
                  left: `${((from - min) / (max - min || 1)) * 100}%`,
                  width: `${((to - from) / (max - min || 1)) * 100}%`,
                }}
              />
              <input type="range" min={min} max={max} value={from}
                onChange={(e) => setFrom(Math.min(Number(e.target.value), to))}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"
              />
              <input type="range" min={min} max={max} value={to}
                onChange={(e) => setTo(Math.max(Number(e.target.value), from))}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Desde</span>
                <input type="number" className="w-28 border rounded-lg px-2 py-1" value={from}
                  onChange={(e) => setFrom(Math.min(Math.max(Number(e.target.value) || min, min), to))}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Hasta</span>
                <input type="number" className="w-28 border rounded-lg px-2 py-1" value={to}
                  onChange={(e) => setTo(Math.max(Math.min(Number(e.target.value) || max, max), from))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((p) => (
          <li key={p.id}>
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              href={`/mochilas/${p.id}`}
              onBuy={() => {
                // Agregar al carrito con estructura CartItem
                addItem({
                  productModelId: p.id,
                  quantity: 1,
                  extras: [],
                }, user);
              }}
            />
          </li>
        ))}
      </ul>
    </>
  );
}