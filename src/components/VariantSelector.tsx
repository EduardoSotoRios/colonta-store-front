// src/components/VariantSelector.tsx
"use client";

import { useState } from "react";
import type { ProductModel } from "@/lib/api";

export default function VariantSelector({
  productModel,
  colorSchemes = [],
  extras = [],
}: {
  productModel: ProductModel;
  colorSchemes?: Array<{
    id: string;
    type: 'preset' | 'custom';
    name: string | null;
    colors: string[];
  }>;
  extras?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
  }>;
}) {
  const [selectedColorSchemeId, setSelectedColorSchemeId] = useState<string | undefined>(
    colorSchemes.find(cs => cs.type === 'preset')?.id
  );

  if (colorSchemes.length === 0 && !productModel.allowCustomColors) {
    return (
      <div className="text-sm text-slate-500">
        Este producto no tiene opciones de personalización disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de esquema de color */}
      {colorSchemes.length > 0 && (
        <div>
          <label className="text-sm font-semibold block mb-2">Esquema de color</label>
          <div className="flex flex-wrap gap-2">
            {colorSchemes.map((cs) => {
              const active = selectedColorSchemeId === cs.id;
              return (
                <button
                  key={cs.id}
                  type="button"
                  onClick={() => setSelectedColorSchemeId(cs.id)}
                  className={`px-4 py-2 rounded-xl border text-sm flex items-center gap-2 ${
                    active
                      ? "bg-colonta-primary text-white border-colonta-primary"
                      : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                >
                  {/* Mostrar colores visualmente */}
                  <div className="flex gap-1">
                    {cs.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full border ${
                          active ? "border-white/50" : "border-slate-300"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <span>{cs.name || "Personalizado"}</span>
                </button>
              );
            })}
            {productModel.allowCustomColors && (
              <button
                type="button"
                onClick={() => setSelectedColorSchemeId(undefined)}
                className={`px-4 py-2 rounded-xl border text-sm ${
                  selectedColorSchemeId === undefined
                    ? "bg-colonta-primary text-white border-colonta-primary"
                    : "border-slate-300 hover:border-slate-400 bg-white"
                }`}
              >
                Personalizar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Información de extras disponibles */}
      {extras.length > 0 && (
        <div>
          <label className="text-sm font-semibold block mb-2">Extras disponibles</label>
          <div className="space-y-2">
            {extras.map((extra) => {
              const price = Number(extra.price) || 0;
              return (
                <div key={extra.id} className="flex items-start gap-2 text-sm">
                  <span className="text-slate-600">•</span>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">{extra.name}</span>
                    {extra.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{extra.description}</p>
                    )}
                  </div>
                  <span className="text-slate-600 font-medium">
                    +${new Intl.NumberFormat("es-CL").format(price)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
