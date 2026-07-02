// src/components/PriceFilter.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PriceFilterProps = {
  categories: string[];  // nombres legibles: ["Mochilas", "Bananos", ...]
  minPrice?: number;
  maxPrice?: number;
};

// Mapa nombre legible → slug para la URL
const NOMBRE_A_SLUG: Record<string, string> = {
  "Mochilas":       "mochilas",
  "Bananos":        "bananos",
  "Bolsos":         "bolsos",
  "Porta Notebook": "notebook",
  "Accesorios":     "accesorios",
};

// Mapa slug → nombre legible para leer la URL inicial
const SLUG_A_NOMBRE: Record<string, string> = Object.fromEntries(
  Object.entries(NOMBRE_A_SLUG).map(([nombre, slug]) => [slug, nombre])
);

export default function PriceFilter({ categories, minPrice = 0, maxPrice = 100000 }: PriceFilterProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();

  const [q,             setQ]             = useState(sp.get("q") ?? "");
  const [maxPriceValue, setMaxPriceValue] = useState(() => {
    const max = sp.get("max");
    return max ? Number(max) : maxPrice;
  });
  // Leer URL como slug y convertir a nombre legible para el dropdown
  const [category, setCategory] = useState(() => {
    const slug = sp.get("category") ?? "";
    return SLUG_A_NOMBRE[slug] ?? slug;
  });
  const [sort, setSort] = useState<"" | "price_asc" | "price_desc">(
    (sp.get("sort") as any) ?? ""
  );

  useEffect(() => {
    if (maxPrice !== undefined) {
      setMaxPriceValue(prev => prev > maxPrice ? maxPrice : prev);
    }
  }, [maxPrice]);

  function aplicarFiltros(overrides: { q?: string; max?: number; category?: string; sort?: string } = {}) {
    const qVal        = overrides.q        !== undefined ? overrides.q        : q;
    const maxVal      = overrides.max      !== undefined ? overrides.max      : maxPriceValue;
    const categoryVal = overrides.category !== undefined ? overrides.category : category;
    const sortVal     = overrides.sort     !== undefined ? overrides.sort     : sort;

    const params = new URLSearchParams();
    if (qVal.trim())         params.set("q",       qVal.trim());
    if (maxVal !== maxPrice) params.set("max",      String(maxVal));
    if (categoryVal.trim()) {
      // Enviar siempre como nombre legible — la página lo convierte a slug
      params.set("category", categoryVal.trim());
    }
    if (sortVal) params.set("sort", sortVal);

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  // Debounce solo para búsqueda de texto
  useEffect(() => {
    const timer = setTimeout(() => {
      aplicarFiltros({ q });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function handleCategory(value: string) {
    setCategory(value);
    aplicarFiltros({ category: value });
  }

  function handleSort(value: "" | "price_asc" | "price_desc") {
    setSort(value);
    aplicarFiltros({ sort: value });
  }

  function handlePriceCommit() {
    aplicarFiltros({ max: maxPriceValue });
  }

  function clearAll() {
    setQ("");
    setMaxPriceValue(maxPrice);
    setCategory("");
    setSort("");
    router.push(pathname);
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency", currency: "CLP",
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Búsqueda */}
        <div className="md:col-span-2">
          <input
            className="w-full border rounded-xl px-3 py-2 text-sm"
            placeholder="Buscar productos..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        {/* Categorías — nombres legibles */}
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={category}
          onChange={e => handleCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Ordenar */}
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={sort}
          onChange={e => handleSort(e.target.value as any)}
        >
          <option value="">Ordenar</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>

        {/* Limpiar */}
        <button
          onClick={clearAll}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold border hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>

      {/* Slider de precio */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">Precio máximo</label>
          <div className="text-sm font-semibold text-colonta-primary">
            {formatPrice(maxPriceValue)}
          </div>
        </div>

        <div className="relative">
          <div className="h-2 bg-slate-200 rounded-full relative">
            <div
              className="absolute h-2 bg-colonta-primary rounded-full"
              style={{ width: `${((maxPriceValue - minPrice) / (maxPrice - minPrice)) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={maxPriceValue}
            onChange={e => setMaxPriceValue(Number(e.target.value))}
            onMouseUp={handlePriceCommit}
            onTouchEnd={handlePriceCommit}
            className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{formatPrice(minPrice)}</span>
          <span>{formatPrice(maxPrice)}</span>
        </div>

        <style jsx>{`
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--colonta-primary, #3b82f6);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transition: transform 0.1s ease;
          }
          .slider-thumb::-webkit-slider-thumb:hover { transform: scale(1.1); }
          .slider-thumb::-moz-range-thumb {
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--colonta-primary, #3b82f6);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>
    </div>
  );
}