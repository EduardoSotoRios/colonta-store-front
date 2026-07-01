"use client";
// src/components/ImageZoom.tsx

import { useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  zoomLevel?: number;
};

const PANEL = 350;

export default function ImageZoom({ src, alt, zoomLevel = 3 }: Props) {
  const imgRef                = useRef<HTMLImageElement>(null);
  const [cursor, setCursor]   = useState({ x: 0, y: 0 });
  const [imgRect, setImgRect] = useState({ w: 0, h: 0, top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLImageElement>) {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setImgRect({ w: rect.width, h: rect.height, top: rect.top, left: rect.left });
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  // Zona del selector centrada en el cursor
  const selectorSize = PANEL / zoomLevel;
  const selLeft = Math.min(Math.max(cursor.x - selectorSize / 2, 0), imgRect.w - selectorSize);
  const selTop  = Math.min(Math.max(cursor.y - selectorSize / 2, 0), imgRect.h - selectorSize);

  // La imagen en el panel se escala zoomLevel veces
  // y se desplaza para que la zona seleccionada quede visible
  // Lógica: el punto selLeft,selTop de la imagen original
  // debe aparecer en 0,0 del panel tras el scale
  const imgScaledW = imgRect.w * zoomLevel;
  const imgScaledH = imgRect.h * zoomLevel;
  const offsetX    = -selLeft * zoomLevel;
  const offsetY    = -selTop  * zoomLevel;

  const panelLeft = imgRect.left + imgRect.w + 16;
  const panelTop  = Math.max(imgRect.top + cursor.y - PANEL / 2, 8);

  return (
    <div className="relative w-full h-full">
      {/* Imagen base */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover cursor-crosshair select-none"
        draggable={false}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      />

      {/* Selector sobre la imagen */}
      {visible && imgRect.w > 0 && (
        <div
          className="absolute pointer-events-none border-2 border-white"
          style={{
            width:     selectorSize,
            height:    selectorSize,
            top:       selTop,
            left:      selLeft,
            zIndex:    10,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)",
          }}
        />
      )}

      {/* Panel flotante */}
      {visible && imgRect.w > 0 && (
        <div
          className="fixed rounded-2xl border-2 border-slate-200 shadow-2xl pointer-events-none overflow-hidden bg-slate-100"
          style={{
            width:  PANEL,
            height: PANEL,
            left:   panelLeft,
            top:    panelTop,
            zIndex: 9999,
          }}
        >
          <img
            src={src}
            alt=""
            style={{
              position:  "absolute",
              width:     imgScaledW,
              height:    imgScaledH,
              top:       offsetY,
              left:      offsetX,
              maxWidth:  "none",   // importante: evita que Next/Tailwind limite el ancho
            }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}