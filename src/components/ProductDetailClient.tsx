"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import type { ProductModel } from "@/lib/api";

type ImagenColor = { nombre: string; hex: string | null };

type Imagen = {
  id: number;
  url: string;
  alt: string | null;
  principal: boolean;
  orden: number;
  colores: ImagenColor[];
};

type Props = {
  product: ProductModel;
  imagenes: Imagen[];
};

export default function ProductDetailClient({ product, imagenes }: Props) {
  const initialImage = imagenes.find((i) => i.principal) ?? imagenes[0] ?? null;
  const [selectedImage, setSelectedImage] = useState<Imagen | null>(initialImage);

  return (
    <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Galería */}
      <div className="lg:col-span-6">
        <ProductGallery
          imagenes={imagenes}
          nombre={product.name}
          fallback={product.imageUrl || "/mochila1.png"}
          onSelectImage={setSelectedImage}
        />
      </div>

      {/* Info + carrito */}
      <div className="lg:col-span-6 space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold">{product.name}</h2>

          {product.tagline && (
            <p className="text-slate-600 mt-1">{product.tagline}</p>
          )}

          {(product.badge || product.personalizable) && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {product.badge && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                  {product.badge}
                </span>
              )}
              {product.personalizable && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Personalizable
                </span>
              )}
            </div>
          )}

          {Number(product.basePrice) > 0 && (
            <p className="mt-3 text-2xl font-extrabold">
              ${new Intl.NumberFormat("es-CL").format(Number(product.basePrice))}
            </p>
          )}
        </div>

        {product.descripcion && (
          <p className="text-slate-500 text-sm leading-relaxed">
            {product.descripcion}
          </p>
        )}

        <AddToCartButton
          productModel={product}
          colorSchemes={product.colorSchemes ?? []}
          extras={product.extras ?? []}
          selectedImage={selectedImage ?? undefined}
        />

        <p className="text-sm text-slate-500">
          Envíos a todo Chile. Cambios y devoluciones fáciles.
        </p>

        {product.specs && product.specs.length > 0 && (
          <div className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
            <h3 className="font-semibold mb-3">Especificaciones</h3>
            <dl className="divide-y divide-slate-100 text-sm">
              {product.specs.map((s, i) => (
                <div key={i} className="flex justify-between py-2 gap-4">
                  <dt className="text-slate-500 shrink-0">{s.label}</dt>
                  <dd className="text-slate-800 text-right">{s.valor}</dd>
                </div>
              ))}
              {product.peso_g && (
                <div className="flex justify-between py-2 gap-4">
                  <dt className="text-slate-500 shrink-0">Peso</dt>
                  <dd className="text-slate-800 text-right">{product.peso_g} g</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {product.caracteristicas && product.caracteristicas.length > 0 && (
          <div className="rounded-2xl ring-1 ring-black/5 bg-white p-4">
            <h3 className="font-semibold mb-3">Características</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {product.caracteristicas.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-colonta-primary shrink-0 mt-0.5">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
