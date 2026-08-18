"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { getColorEmoji } from "@/lib/colores-map";
import FavoriteButton from "@/components/FavoriteButton";
import { subirImagenEstampado } from "@/actions/extras-meta";
import type { ProductModel, CartItem } from "@/lib/api";

const esExtraEstampado = (nombre: string) => nombre.toLowerCase().includes("estampado");

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
    imageUrl?: string;
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
  const [previewExtra, setPreviewExtra] = useState<(typeof extras)[0] | null>(null);
  const [stampImageUrl, setStampImageUrl] = useState<string | null>(null);
  const [subiendoStamp, setSubiendoStamp] = useState(false);
  const [stampError, setStampError] = useState<string | null>(null);

  const hasImageSelected = selectedImage !== undefined;
  const hasImageColors = hasImageSelected && selectedImage.colores.length > 0;

  const handleSubirStamp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoStamp(true);
    setStampError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const url = await subirImagenEstampado(fd);
      setStampImageUrl(url);
    } catch (err: any) {
      setStampError(err?.message ?? "Error al subir imagen");
    } finally {
      setSubiendoStamp(false);
      e.target.value = "";
    }
  };

  const handleAdd = async () => {
    const item: CartItem = {
      productModelId: productModel.id,
      quantity: Math.max(1, qty),
      extras: selectedExtras || [],
      productName: productModel.name,
      unitPrice: Number(productModel.basePrice),
    };

    if (stampImageUrl) {
      item.stampImageUrl = stampImageUrl;
    }

    if (hasImageSelected) {
      item.imageId = selectedImage.id;
      item.productImageUrl = selectedImage.url;
      if (hasImageColors) {
        item.colorScheme = {
          type: "custom",
          name: selectedImage.colores.map((c) => c.nombre).join(" / "),
          colors: selectedImage.colores.map((c) => c.hex ?? c.nombre),
        };
      }
    } else if (selectedColorSchemeId) {
      item.colorSchemeId = selectedColorSchemeId;
    }

    await addItem(item, user);
  };

  const toggleExtra = (extraId: string, nombre: string) => {
    const wasSelected = selectedExtras.includes(extraId);
    setSelectedExtras((prev) =>
      wasSelected ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
    // Al deseleccionar estampado, limpiar la imagen
    if (wasSelected && esExtraEstampado(nombre)) {
      setStampImageUrl(null);
      setStampError(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Modal preview imagen extra */}
      {previewExtra?.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setPreviewExtra(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-100 aspect-square w-full">
              <img
                src={previewExtra.imageUrl}
                alt={previewExtra.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{previewExtra.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  +${new Intl.NumberFormat("es-CL").format(Number(previewExtra.price))}
                </p>
              </div>
              <button
                onClick={() => setPreviewExtra(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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
                const isEstampado = esExtraEstampado(extra.name);
                return (
                  <div key={extra.id}>
                    <label
                      className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl border transition-colors ${
                        isSelected
                          ? "border-colonta-primary bg-colonta-primary/5"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleExtra(extra.id, extra.name)}
                        className="rounded shrink-0 accent-colonta-primary"
                      />
                      {/* Imagen del extra — clic abre preview */}
                      <div
                        className={`w-12 h-12 rounded-lg shrink-0 overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center ${extra.imageUrl ? "cursor-zoom-in hover:ring-2 hover:ring-colonta-primary" : ""}`}
                        onClick={(e) => {
                          if (!extra.imageUrl) return;
                          e.preventDefault();
                          setPreviewExtra(extra);
                        }}
                      >
                        {extra.imageUrl ? (
                          <img
                            src={extra.imageUrl}
                            alt={extra.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {extra.name}
                          </span>
                          <span
                            className={`text-sm font-semibold shrink-0 ${
                              isSelected ? "text-colonta-primary" : "text-slate-600"
                            }`}
                          >
                            +${new Intl.NumberFormat("es-CL").format(price)}
                          </span>
                        </div>
                        {extra.description && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {extra.description}
                          </p>
                        )}
                      </div>
                    </label>

                    {/* Bloque de subida para estampado */}
                    {isEstampado && isSelected && (
                      <div className="mt-1.5 ml-2 rounded-xl border border-dashed border-colonta-primary/40 bg-colonta-primary/5 p-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">
                          Sube tu diseño para estampar
                        </p>
                        {stampImageUrl ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={stampImageUrl}
                              alt="Diseño a estampar"
                              className="w-16 h-16 rounded-lg object-contain border border-slate-200 bg-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-green-700 font-medium">Imagen cargada</p>
                              <label className="mt-1 inline-block text-xs text-slate-500 underline cursor-pointer hover:text-slate-700">
                                Cambiar imagen
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={subiendoStamp}
                                  onChange={handleSubirStamp}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${subiendoStamp ? "opacity-60 pointer-events-none" : ""}`}
                          >
                            {subiendoStamp ? (
                              <>
                                <svg className="w-5 h-5 text-colonta-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                <span className="text-xs text-slate-500">Subiendo…</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                <span className="text-xs text-slate-600 font-medium">Seleccionar imagen</span>
                                <span className="text-[11px] text-slate-400">JPG, PNG, SVG — máx. 8 MB</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={subiendoStamp}
                              onChange={handleSubirStamp}
                            />
                          </label>
                        )}
                        {stampError && (
                          <p className="mt-2 text-xs text-red-600">{stampError}</p>
                        )}
                      </div>
                    )}
                  </div>
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
