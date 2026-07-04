"use client";
// src/components/BlueExpressMap.tsx
// Mapa Leaflet + OpenStreetMap — cargado solo en cliente (no SSR)

import { useEffect, useRef } from "react";
import type { BlueExpressPoint } from "@/lib/blue-express-points";

interface Props {
  points: BlueExpressPoint[];
  selected: BlueExpressPoint | null;
  onSelect: (point: BlueExpressPoint) => void;
}

export default function BlueExpressMap({ points, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: any;
    let map: any;

    (async () => {
      L = await import("leaflet");

      // Coordenadas iniciales: primer punto o Santiago por defecto
      const initPoint = points[0] ?? { lat: -33.4489, lng: -70.6693 };

      map = L.map(containerRef.current!, {
        center: [initPoint.lat, initPoint.lng],
        zoom: 11,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      renderMarkers(L, map, points, selected, onSelect);
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
    // Solo se ejecuta al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar marcadores cuando cambian los puntos o la selección
  useEffect(() => {
    if (!mapRef.current) return;

    (async () => {
      const L = await import("leaflet");
      // Limpiar marcadores previos
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();

      renderMarkers(L, mapRef.current, points, selected, onSelect);

      // Ajustar vista a los puntos visibles
      if (points.length > 0) {
        const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);
        const bounds = L.latLngBounds(latLngs);
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, selected]);

  function renderMarkers(
    L: any,
    map: any,
    pts: BlueExpressPoint[],
    sel: BlueExpressPoint | null,
    onSel: (p: BlueExpressPoint) => void
  ) {
    pts.forEach((point) => {
      const isSelected = sel?.id === point.id;

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: ${isSelected ? 36 : 28}px;
            height: ${isSelected ? 36 : 28}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: ${isSelected ? "#0056A2" : "#64748b"};
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: ${isSelected ? 14 : 11}px;
              font-weight: bold;
              line-height: 1;
            ">B</div>
          </div>`,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 36 : 28],
        popupAnchor: [0, -(isSelected ? 36 : 28)],
      });

      const marker = L.marker([point.lat, point.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:180px;font-family:sans-serif">
            <p style="font-weight:700;font-size:13px;margin:0 0 4px">${point.name}</p>
            <p style="font-size:11px;color:#475569;margin:0 0 2px">${point.address}, ${point.comuna}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0">${point.hours}</p>
            <button
              onclick="window._beSelect('${point.id}')"
              style="
                margin-top:8px;width:100%;padding:5px 0;
                background:#0056A2;color:white;border:none;
                border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;
              "
            >Seleccionar este punto</button>
          </div>`,
          { maxWidth: 240 }
        )
        .on("click", () => {
          onSel(point);
        });

      markersRef.current.set(point.id, marker);
    });

    // Exponer función global para el botón dentro del popup
    (window as any)._beSelect = (id: string) => {
      const p = pts.find((x) => x.id === id);
      if (p) onSel(p);
      map.closePopup();
    };
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-slate-200"
      style={{ height: 300 }}
    />
  );
}
