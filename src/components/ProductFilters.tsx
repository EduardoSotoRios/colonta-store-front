"use client";
import { useState } from "react";

export default function ProductFilters() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [range, setRange] = useState<number>(50000);

  return (
    <form className="space-y-4">
      <div>
        <label className="text-sm font-semibold">Buscar</label>
        <div className="mt-1 relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Mochila, color..."
            className="w-full rounded-xl border-slate-200 focus:border-colonta-primary focus:ring-colonta-primary pl-10 pr-3 py-2 text-sm"
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/>
          </svg>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">Categoría</label>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="mt-1 w-full rounded-xl border-slate-200 px-3 py-2 text-sm"
        >
          <option value="todas">Todas</option>
          <option value="viaje">Viaje</option>
          <option value="urbano">Urbano</option>
          <option value="diario">Día a día</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold flex items-center justify-between">
          Precio máximo <span className="text-slate-500">${new Intl.NumberFormat("es-CL").format(range)}</span>
        </label>
        <input
          type="range"
          min={10000}
          max={100000}
          step={1000}
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="mt-2 w-full accent-colonta-primary"
        />
      </div>

      <button
        type="button"
        className="w-full px-4 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90"
        onClick={() => alert("Aquí aplicarías los filtros (demo).")}
      >
        Aplicar filtros
      </button>

      <button
        type="button"
        className="w-full px-4 py-2.5 rounded-xl font-semibold border hover:bg-slate-50"
        onClick={() => { setQuery(""); setCat("todas"); setRange(50000); }}
      >
        Limpiar
      </button>
    </form>
  );
}