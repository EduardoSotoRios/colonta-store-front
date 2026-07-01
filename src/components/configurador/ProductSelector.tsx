'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PRODUCT_LIST, MOCHILA_TYPES, type ProductId } from '@/lib/configurador/products';

interface ProductSelectorProps {
  onSelect: (id: ProductId, name: string) => void;
}

export default function ProductSelector({ onSelect }: ProductSelectorProps) {
  const [mochilaModal, setMochilaModal] = useState(false);

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#5B2D8E] to-[#7B4FBE] py-14 px-4 text-center">
        <h1 className="font-black text-4xl md:text-6xl text-white leading-tight tracking-tight mb-3">
          Diseña tu <span className="text-yellow-300">mochila</span>
        </h1>
        <p className="text-white/80 text-lg max-w-md mx-auto">
          Elige tu producto, colorea con nuestras telas y envíanos tu diseño.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
        {PRODUCT_LIST.map(p => (
          <button
            key={p.id}
            onClick={() => {
              if ('isMochila' in p && p.isMochila) {
                setMochilaModal(true);
              } else {
                onSelect(p.id as ProductId, p.name);
              }
            }}
            className="group bg-white border-2 border-gray-100 rounded-2xl p-4 text-center cursor-pointer transition-all
              hover:border-[#5B2D8E] hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#5B2D8E]"
          >
            <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl bg-gray-50">
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-contain p-2 transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold text-sm text-gray-800">{p.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
          </button>
        ))}
      </div>

      {/* Modal subtipo mochila */}
      {mochilaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setMochilaModal(false); }}
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">¿Qué tipo de mochila?</h2>
              <button
                onClick={() => setMochilaModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOCHILA_TYPES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMochilaModal(false); onSelect(m.id, `Mochila ${m.name}`); }}
                  className="group border-2 border-gray-100 rounded-2xl p-3 text-center hover:border-[#5B2D8E] hover:shadow-md transition-all focus:outline-none"
                >
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl bg-gray-50">
                    <Image src={m.image} alt={m.name} fill className="object-contain p-1" />
                  </div>
                  <p className="font-semibold text-sm text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
