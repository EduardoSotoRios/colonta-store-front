"use client";
// src/components/ImageZoom.tsx

import { useRef, useState, useEffect } from "react";

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
  const [lightbox, setLightbox] = useState(false);
  const [isTouch, setIsTouch]   = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // ── Modo táctil: tap → lightbox ───────────────────────────────────────────
  if (isTouch) {
    return (
      <>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover cursor-zoom-in select-none"
          draggable={false}
          onClick={() => setLightbox(true)}
        />
        {lightbox && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none"
              onClick={() => setLightbox(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        )}
      </>
    );
  }

  // ── Modo escritorio: hover zoom ───────────────────────────────────────────
  function handleMouseMove(e: React.MouseEvent<HTMLImageElement>) {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setImgRect({ w: rect.width, h: rect.height, top: rect.top, left: rect.left });
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const selectorSize = PANEL / zoomLevel;
  const selLeft = Math.min(Math.max(cursor.x - selectorSize / 2, 0), imgRect.w - selectorSize);
  const selTop  = Math.min(Math.max(cursor.y - selectorSize / 2, 0), imgRect.h - selectorSize);

  const imgScaledW = imgRect.w * zoomLevel;
  const imgScaledH = imgRect.h * zoomLevel;
  const offsetX    = -selLeft * zoomLevel;
  const offsetY    = -selTop  * zoomLevel;

  const panelLeft = imgRect.left + imgRect.w + 16;
  const panelTop  = Math.max(imgRect.top + cursor.y - PANEL / 2, 8);

  return (
    <div className="relative w-full h-full">
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

      {visible && imgRect.w > 0 && (
        <div
          className="absolute pointer-events-none border-2 border-white"
          style={{
            width: selectorSize, height: selectorSize,
            top: selTop, left: selLeft,
            zIndex: 10,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)",
          }}
        />
      )}

      {visible && imgRect.w > 0 && (
        <div
          className="fixed rounded-2xl border-2 border-slate-200 shadow-2xl pointer-events-none overflow-hidden bg-slate-100"
          style={{ width: PANEL, height: PANEL, left: panelLeft, top: panelTop, zIndex: 9999 }}
        >
          <img
            src={src}
            alt=""
            style={{
              position: "absolute",
              width: imgScaledW, height: imgScaledH,
              top: offsetY, left: offsetX,
              maxWidth: "none",
            }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}