"use client";
// src/components/ProductGallery.tsx

import { useEffect, useState } from "react";
import ImageZoom from "@/components/ImagenZoom";
import { getColorEmoji } from "@/lib/colores-map";

type ImagenColor = { nombre: string; hex: string | null; activo?: boolean };

type Imagen = {
  id: number;
  url: string;
  alt: string | null;
  principal: boolean;
  orden: number;
  colores: ImagenColor[];
};

function esImagenAgotada(img: Imagen): boolean {
  return img.colores.some((c) => c.activo === false);
}

type Props = {
  imagenes: Imagen[];
  nombre: string;
  fallback?: string;
  onSelectImage?: (img: Imagen) => void;
};

function ColorSwatch({ color, size = "md" }: { color: ImagenColor; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  if (color.hex) {
    return (
      <div
        className={`${dim} rounded-full border border-black/10 shrink-0`}
        style={{ backgroundColor: color.hex }}
        title={color.nombre}
      />
    );
  }
  return (
    <span className="text-sm leading-none" title={color.nombre}>
      {getColorEmoji(color.nombre) ?? "🎨"}
    </span>
  );
}

export default function ProductGallery({ imagenes, nombre, fallback = "/mochila1.png", onSelectImage }: Props) {
  const principal = imagenes.find(i => i.principal) ?? imagenes[0];
  // Si la variante principal quedo agotada, arrancar en la primera disponible en su lugar.
  const inicial = (principal && esImagenAgotada(principal))
    ? (imagenes.find(i => !esImagenAgotada(i)) ?? principal)
    : principal;
  const [selected, setSelected] = useState<Imagen | null>(inicial ?? null);
  const [hovered,  setHovered]  = useState<Imagen | null>(null);

  // El padre (ProductDetailClient) calcula su propia "imagen inicial" por su cuenta
  // (sin saber de variantes agotadas) para pasarsela a AddToCartButton. Le avisamos
  // cual es la que realmente quedo seleccionada para que nunca queden desincronizados
  // y no se pueda agregar al carrito una variante agotada por defecto.
  useEffect(() => {
    if (inicial) onSelectImage?.(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectImage(img: Imagen) {
    if (esImagenAgotada(img)) return;
    setSelected(img);
    onSelectImage?.(img);
  }

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-3">
        <div className="aspect-[4/5] overflow-visible rounded-xl bg-slate-100">
          <ImageZoom src={fallback} alt={nombre} zoomLevel={3} />
        </div>
      </div>
    );
  }

  const imagenActiva = selected ?? imagenes[0];

  return (
    <div className="space-y-3">
      {/* Imagen principal */}
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-3">
        <div className="aspect-[4/5] overflow-visible rounded-xl bg-slate-100">
          <ImageZoom
            src={imagenActiva.url || fallback}
            alt={imagenActiva.alt || nombre}
            zoomLevel={3}
          />
        </div>

        {/* Swatches de la imagen activa */}
        {imagenActiva.colores.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 px-1">
            {imagenActiva.colores.map((color, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <ColorSwatch color={color} />
                <span className="text-xs text-slate-600">{color.nombre}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {imagenes.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {imagenes.map(img => {
            const isActive  = selected?.id === img.id;
            const isHovered = hovered?.id === img.id;
            const agotada   = esImagenAgotada(img);

            return (
              <div
                key={img.id}
                className={`relative group ${agotada ? "cursor-not-allowed" : "cursor-pointer"}`}
                onClick={() => selectImage(img)}
                onMouseEnter={() => setHovered(img)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className={`relative aspect-square rounded-xl overflow-hidden ring-2 transition-all ${
                  isActive ? "ring-colonta-primary" : "ring-transparent hover:ring-slate-300"
                } ${agotada ? "opacity-40" : ""}`}>
                  <img
                    src={img.url || fallback}
                    alt={img.alt || nombre}
                    className="w-full h-full object-cover"
                  />
                  {agotada && (
                    <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[10px] font-semibold text-center py-0.5">
                      Agotado
                    </span>
                  )}
                </div>

                {/* Puntos de color debajo de la miniatura */}
                {img.colores.length > 0 && (
                  <div className="flex justify-center gap-1 mt-1">
                    {img.colores.map((c, i) => (
                      <ColorSwatch key={i} color={c} size="sm" />
                    ))}
                  </div>
                )}

                {/* Tooltip al hover */}
                {isHovered && img.colores.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-max max-w-[180px]">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-2 shadow-lg space-y-1">
                      {img.colores.map((color, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <ColorSwatch color={color} size="sm" />
                          <span>{color.nombre}</span>
                        </div>
                      ))}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
