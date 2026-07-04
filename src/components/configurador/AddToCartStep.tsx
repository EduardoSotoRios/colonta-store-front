'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
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

export default function AddToCartStep({ productId, productName, designDataURL, onAdded, onBack }: AddToCartStepProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const price = CUSTOM_ORDER_PRICES[productId];
  const priceCL = new Intl.NumberFormat('es-CL').format(price);
  const totalCL = new Intl.NumberFormat('es-CL').format(price * qty);

  async function handleAddToCart() {
    setUploading(true);
    setError('');
    try {
      const imageUrl = await subirDisenioPersonalizado(designDataURL);
      const item: CartItem = {
        productModelId: CUSTOM_ORDER_PRODUCT_MODEL_IDS[productId],
        quantity: qty,
        extras: [],
        customDesignImageUrl: imageUrl,
        unitPrice: price,
      };
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

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={designDataURL} alt="Vista previa del diseño" className="max-h-56 object-contain rounded-lg" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{productName} (Personalizado)</p>
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
