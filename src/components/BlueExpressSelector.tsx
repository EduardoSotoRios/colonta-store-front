"use client";
// src/components/BlueExpressSelector.tsx

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  BLUE_EXPRESS_POINTS,
  REGIONS_ORDER,
  type BlueExpressPoint,
} from "@/lib/blue-express-points";

const BlueExpressMap = dynamic(() => import("@/components/BlueExpressMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-xl bg-slate-100 animate-pulse border border-slate-200 flex items-center justify-center">
      <span className="text-sm text-slate-400">Cargando mapa…</span>
    </div>
  ),
});

interface Props {
  selected: BlueExpressPoint | null;
  onChange: (point: BlueExpressPoint) => void;
}

export default function BlueExpressSelector({ selected, onChange }: Props) {
  const [regionFilter, setRegionFilter] = useState<string>(
    selected?.region ?? "Región Metropolitana"
  );
  const [search, setSearch] = useState("");

  const regions = useMemo(
    () => REGIONS_ORDER.filter((r) => BLUE_EXPRESS_POINTS.some((p) => p.region === r)),
    []
  );

  const filtered = useMemo(() => {
    const byRegion = BLUE_EXPRESS_POINTS.filter((p) => p.region === regionFilter);
    if (!search.trim()) return byRegion;
    const q = search.toLowerCase();
    return byRegion.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.comuna.toLowerCase().includes(q)
    );
  }, [regionFilter, search]);

  function handleRegionChange(region: string) {
    setRegionFilter(region);
    setSearch("");
  }

  return (
    <div className="space-y-4">
      {/* Selector de región */}
      <div>
        <label className="text-sm font-semibold block mb-1">Región</label>
        <select
          value={regionFilter}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
        >
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Mapa */}
      <BlueExpressMap
        points={filtered}
        selected={selected}
        onSelect={onChange}
      />

      {/* Buscador */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre, dirección o comuna…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {/* Lista de puntos */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            No hay puntos disponibles para esta búsqueda.
          </p>
        )}
        {filtered.map((point) => {
          const isSelected = selected?.id === point.id;
          return (
            <button
              key={point.id}
              type="button"
              onClick={() => onChange(point)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                isSelected
                  ? "border-colonta-primary bg-colonta-primary/5"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {point.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {point.address}, {point.comuna}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{point.hours}</p>
                </div>
                {isSelected && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-colonta-primary flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Punto seleccionado */}
      {selected && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-start gap-2">
          <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-green-800">{selected.name}</p>
            <p className="text-xs text-green-700">{selected.address}, {selected.comuna}</p>
            <p className="text-xs text-green-600">{selected.hours}</p>
          </div>
        </div>
      )}
    </div>
  );
}
