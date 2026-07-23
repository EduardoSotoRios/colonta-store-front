"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { getColorEmoji } from "@/lib/colores-map";
import FavoriteButton from "@/components/FavoriteButton";
import type { ProductModel, CartItem } from "@/lib/api";

type ImagenColor = { nombre: string; hex: string | null };

type SelectedImage = {
  id: number;
  url: string;
  alt: string | null;
  colores: ImagenColor[];
};

function ColorDot({ color }: { color: ImagenColor }) {
  if (color.hex) {
    return (
      <div
        className="w-5 h-5 rounded-full border-2 border-white shadow"
        style={{ backgroundColor: color.hex }}
        title={color.nombre}
      />
    );
  }
  return (
    <span className="text-base leading-none" title={color.nombre}>
      {getColorEmoji(color.nombre) ?? "🎨"}
    </span>
  );
}

export default function AddToCartButton({
  productModel,
  colorSchemes = [],
  extras = [],
  selectedImage,
}: {
  productModel: ProductModel;
  colorSchemes?: Array<{
    id: string;
    type: "preset" | "custom";
    name: string | null;
    colors: string[];
  }>;
  extras?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
  }>;
  selectedImage?: SelectedImage;
}) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [selectedColorSchemeId, setSelectedColorSchemeId] = useState<
    string | undefined
  >(colorSchemes.find((cs) => cs.type === "preset")?.id);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [extrasOpen, setExtrasOpen] = useState(false);

  const hasImageSelected = selectedImage !== undefined;
  const hasImageColors = hasImageSelected && selectedImage.colores.length > 0;

  const handleAdd = async () => {
    const item: CartItem = {
      productModelId: productModel.id,
      quantity: Math.max(1, qty),
      extras: selectedExtras || [],
      productName: productModel.name,
      unitPrice: Number(productModel.basePrice),
    };

    if (hasImageSelected) {
      item.imageId = selectedImage.id;
      item.productImageUrl = selectedImage.url;
      if (hasImageColors) {
        item.colorScheme = {
          type: "custom",
          name: selectedImage.colores.map((c) => c.nombre).join(" / "),
          colors: selectedImage.colores.map((c) => c.nombre),
        };
      }
    } else if (selectedColorSchemeId) {
      item.colorSchemeId = selectedColorSchemeId;
    }

    await addItem(item, user);
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Variante seleccionada */}
      {hasImageSelected ? (
        <div className="rounded-xl bg-colonta-primary/5 border border-colonta-primary/20 px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Variante seleccionada
          </p>
          <div className="flex items-center gap-3">
            <img
              src={selectedImage.url}
              alt={selectedImage.alt ?? ""}
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              {hasImageColors ? (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedImage.colores.map((color, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <ColorDot color={color} />
                      <span className="text-sm font-medium text-slate-800">
                        {color.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-700">
                  Variante seleccionada
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Selecciona otra imagen para cambiar variante.
              </p>
            </div>
          </div>
        </div>
      ) : colorSchemes.length > 0 ? (
        <div>
          <label className="text-sm font-semibold block mb-2">
            Esquema de color
          </label>
          <div className="flex flex-wrap gap-2">
            {colorSchemes.map((cs) => {
              const isSelected = selectedColorSchemeId === cs.id;
              return (
                <button
                  key={cs.id}
                  type="button"
                  onClick={() => setSelectedColorSchemeId(cs.id)}
                  className={`px-4 py-2 rounded-xl border text-sm flex items-center gap-2 ${
                    isSelected
                      ? "border-colonta-primary bg-colonta-primary/10"
                      : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                >
                  <div className="flex gap-1">
                    {cs.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-slate-300"
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
                    ? "border-colonta-primary bg-colonta-primary/10"
                    : "border-slate-300 hover:border-slate-400 bg-white"
                }`}
              >
                Personalizar
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Extras colapsable */}
      {extras.length > 0 && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          {/* Cabecera del acordeón */}
          <button
            type="button"
            onClick={() => setExtrasOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">
                Extras opcionales
              </span>
              {selectedExtras.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-colonta-primary text-white">
                  {selectedExtras.length} seleccionado
                  {selectedExtras.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                extrasOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Lista de extras */}
          {extrasOpen && (
            <div className="border-t border-slate-200 p-3 space-y-2">
              {extras.map((extra) => {
                const price = Number(extra.price) || 0;
                const isSelected = selectedExtras.includes(extra.id);
                return (
                  <label
                    key={extra.id}
                    className={`flex items-start gap-3 cursor-pointer p-2.5 rounded-xl border transition-colors ${
                      isSelected
                        ? "border-colonta-primary bg-colonta-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleExtra(extra.id)}
                      className="rounded mt-0.5 accent-colonta-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {extra.name}
                        </span>
                        <span
                          className={`text-sm font-semibold shrink-0 ${
                            isSelected
                              ? "text-colonta-primary"
                              : "text-slate-600"
                          }`}
                        >
                          +${new Intl.NumberFormat("es-CL").format(price)}
                        </span>
                      </div>
                      {extra.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {extra.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selector de cantidad */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold">Cantidad</label>
        <div className="inline-flex items-center rounded-xl border">
          <button
            type="button"
            className="px-3 py-2"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
          >
            –
          </button>
          <input
            type="number"
            min={1}
            className="w-12 text-center py-2 outline-none"
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Number(e.target.value) || 1))
            }
          />
          <button
            type="button"
            className="px-3 py-2"
            onClick={() => setQty((n) => n + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90"
        >
          Agregar al carrito
        </button>
        <FavoriteButton
          productId={
            hasImageSelected
              ? `${productModel.id}:${selectedImage.id}`
              : productModel.id
          }
        />
      </div>
    </div>
  );
}
