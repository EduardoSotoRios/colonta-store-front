'use client';

import { useEffect, useState } from 'react';
import { getExtrasConImagenes } from '@/actions/extras-meta';

export type ExtraCatalogItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
};

// Mismo criterio que AddToCartButton.tsx: no hay un campo dedicado en la
// base de datos para distinguir el extra "estampado" del resto, asi que se
// detecta por nombre.
export const esExtraEstampado = (nombre: string) => nombre.toLowerCase().includes('estampado');

// El catalogo de extras es el mismo para toda la tienda (no depende del
// producto), asi que una sola carga cacheada a nivel de modulo alcanza para
// todos los componentes que lo necesiten (el carrito, el checkout y el paso
// 3 del configurador) en vez de repetir el fetch en cada uno.
let cachedPromise: Promise<ExtraCatalogItem[]> | null = null;

function fetchExtrasCatalog(): Promise<ExtraCatalogItem[]> {
  if (!cachedPromise) {
    cachedPromise = getExtrasConImagenes().catch((err) => {
      cachedPromise = null; // permite reintentar en la proxima llamada si fallo
      throw err;
    });
  }
  return cachedPromise;
}

export function useExtrasCatalog(): { extras: ExtraCatalogItem[]; loading: boolean } {
  const [extras, setExtras] = useState<ExtraCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchExtrasCatalog()
      .then((data) => { if (!cancelled) setExtras(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { extras, loading };
}
