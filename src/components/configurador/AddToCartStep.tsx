'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useExtrasCatalog, esExtraEstampado } from '@/hooks/useExtrasCatalog';
import { subirImagenEstampado } from '@/actions/extras-meta';
import { subirDisenioPersonalizado } from '@/app/personalizar/actions';
import {
  CUSTOM_ORDER_PRODUCT_MODEL_IDS,
  CUSTOM_ORDER_PRICES,
} from '@/lib/configurador/customOrderProducts';
import type { ProductId } from '@/lib/configurador/products';
import type { CartItem } from '@/lib/api';

interface AddToCartStepProps {
  productId: ProductId;
  productName: string;
  designDataURL: string;
  onAdded: () => void;
  onBack: () => void;
}

const CLP = (n: number) => new Intl.NumberFormat('es-CL').format(n);

export default function AddToCartStep({ productId, productName, designDataURL, onAdded, onBack }: AddToCartStepProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { extras } = useExtrasCatalog();
  const [qty, setQty] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [previewExtra, setPreviewExtra] = useState<(typeof extras)[0] | null>(null);
  const [stampImageUrl, setStampImageUrl] = useState<string | null>(null);
  const [subiendoStamp, setSubiendoStamp] = useState(false);
  const [stampError, setStampError] = useState<string | null>(null);

  const basePrice = CUSTOM_ORDER_PRICES[productId];
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const e = extras.find((x) => x.id === id);
    return sum + (e ? Number(e.price) || 0 : 0);
  }, 0);
  const unitPrice = basePrice + extrasTotal;
  const priceCL = CLP(basePrice);
  const totalCL = CLP(unitPrice * qty);

  const toggleExtra = (extraId: string, nombre: string) => {
    const wasSelected = selectedExtras.includes(extraId);
    setSelectedExtras((prev) =>
      wasSelected ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
    // Al deseleccionar estampado, limpiar la imagen ya subida.
    if (wasSelected && esExtraEstampado(nombre)) {
      setStampImageUrl(null);
      setStampError(null);
    }
  };

  const handleSubirStamp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoStamp(true);
    setStampError(null);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const url = await subirImagenEstampado(fd);
      setStampImageUrl(url);
    } catch (err: any) {
      setStampError(err?.message ?? 'Error al subir imagen');
    } finally {
      setSubiendoStamp(false);
      e.target.value = '';
    }
  };

  async function handleAddToCart() {
    setUploading(true);
    setError('');
    try {
      const imageUrl = await subirDisenioPersonalizado(designDataURL);
      const item: CartItem = {
        productModelId: CUSTOM_ORDER_PRODUCT_MODEL_IDS[productId],
        quantity: qty,
        extras: selectedExtras,
        customDesignImageUrl: imageUrl,
        unitPrice,
      };
      if (stampImageUrl) {
        item.stampImageUrl = stampImageUrl;
      }
      await addItem(item, user);
      onAdded();
    } catch {
      setError('No se pudo agregar tu diseño al carrito. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-2xl font-bold text-gray-800">¡Tu diseño está listo! 🎉</h2>
        <p className="text-gray-500 text-sm">
          Agrégalo al carrito y sigue el proceso de compra normal, como con cualquier otro producto.
        </p>

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewExtra.imageUrl}
                  alt={previewExtra.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{previewExtra.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">+${CLP(Number(previewExtra.price))}</p>
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

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={designDataURL} alt="Vista previa del diseño" className="max-h-56 object-contain rounded-lg" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{productName} (Diseñado)</p>
            <p className="text-sm text-gray-500">${priceCL} c/u</p>
          </div>
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
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
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

        {/* Extras opcionales — mismo acordeón que en la ficha de producto normal */}
        {extras.length > 0 && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExtrasOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">Extras opcionales</span>
                {selectedExtras.length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-colonta-primary text-white">
                    {selectedExtras.length} seleccionado{selectedExtras.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${extrasOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

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
                            ? 'border-colonta-primary bg-colonta-primary/5'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleExtra(extra.id, extra.name)}
                          className="rounded shrink-0 accent-colonta-primary"
                        />
                        <div
                          className={`w-12 h-12 rounded-lg shrink-0 overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center ${extra.imageUrl ? 'cursor-zoom-in hover:ring-2 hover:ring-colonta-primary' : ''}`}
                          onClick={(e) => {
                            if (!extra.imageUrl) return;
                            e.preventDefault();
                            setPreviewExtra(extra);
                          }}
                        >
                          {extra.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={extra.imageUrl} alt={extra.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-slate-900 truncate">{extra.name}</span>
                            <span className={`text-sm font-semibold shrink-0 ${isSelected ? 'text-colonta-primary' : 'text-slate-600'}`}>
                              +${CLP(price)}
                            </span>
                          </div>
                          {extra.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{extra.description}</p>
                          )}
                        </div>
                      </label>

                      {/* Bloque de subida para estampado — igual que en la ficha de producto normal */}
                      {isEstampado && isSelected && (
                        <div className="mt-1.5 ml-2 rounded-xl border border-dashed border-colonta-primary/40 bg-colonta-primary/5 p-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Sube tu diseño para estampar</p>
                          {stampImageUrl ? (
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
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
                              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${subiendoStamp ? 'opacity-60 pointer-events-none' : ''}`}
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
                          {stampError && <p className="mt-2 text-xs text-red-600">{stampError}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between font-bold text-gray-800 border-t pt-3">
          <span>Total</span>
          <span>${totalCL}</span>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={uploading}
          className="w-full py-3 bg-[#5B2D8E] hover:bg-[#4a2275] disabled:opacity-60 text-white font-semibold rounded-2xl transition-colors text-sm"
        >
          {uploading ? 'Agregando…' : '🛒 Agregar al carrito'}
        </button>

        <button onClick={onBack} disabled={uploading} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors pt-1 disabled:opacity-60">
          ← Volver al diseño
        </button>
      </div>
    </div>
  );
}
