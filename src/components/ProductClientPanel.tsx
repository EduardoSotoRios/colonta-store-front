// src/components/ProductClientPanel.tsx
"use client";

import VariantSelector from "@/components/VariantSelector";
import AddToCartButton from "@/components/AddToCartButton";
import type { ProductModel } from "@/lib/api";

export default function ProductClientPanel({ product }: { product: ProductModel }) {
  const priceCL = new Intl.NumberFormat("es-CL").format(Number(product.basePrice));

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-3">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100">
              <img src={product.imageUrl || "/mochila1.png"} alt={product.name} className="w-full h-full object-cover"/>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold">{product.name}</h2>
            <p className="text-slate-600 mt-1">Mochila Colonta – resistente y cómoda para viaje, urbano y día a día.</p>
            <p className="mt-3 text-2xl font-extrabold">${priceCL}</p>
          </div>

          <VariantSelector 
            productModel={product}
            colorSchemes={product.colorSchemes || []}
            extras={product.extras || []}
          />

          <div className="space-y-2">
            <AddToCartButton 
              productModel={product}
              colorSchemes={product.colorSchemes || []}
              extras={product.extras || []}
            />
            <p className="text-sm text-slate-500">Envíos a todo Chile. Cambios y devoluciones fáciles.</p>
          </div>
        </div>
      </div>
    </section>
  );
}