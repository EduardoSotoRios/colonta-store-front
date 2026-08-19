import { EXTRAS_MOCHILA_NORMAL, EXTRAS_MOCHILA_LIGERA, EXTRAS_BANANO } from '@/lib/extrasCatalog';
import type { ProductId } from './products';

// Que extras "de accesorio" (aparte de Estampado, que aplica siempre a
// cualquier producto personalizado — ver esExtraEstampado) tiene sentido
// ofrecer para cada producto del configurador. Reusa las mismas listas ya
// usadas para los productos reales de Supabase (mochila normal/ligera,
// bananos — ver extrasParaProducto en src/lib/extrasCatalog.ts). Los demas
// productos (billetera, porta notebook, porta matt, bolso, tabaquera, roll
// top, mochila mini) todavia no tienen accesorios propios definidos en el
// negocio, asi que por ahora solo ofrecen Estampado — sin esta lista
// mostraban el catalogo completo de extras sin importar si tenian sentido
// para ese producto (ej. "Cinta Matt Yoga" en una billetera).
export const CONFIGURADOR_EXTRA_IDS: Partial<Record<ProductId, string[]>> = {
  mochila_normal: EXTRAS_MOCHILA_NORMAL.map(e => e.id),
  mochila_ligera: EXTRAS_MOCHILA_LIGERA.map(e => e.id),
  banano:         EXTRAS_BANANO.map(e => e.id),
  banano_simple:  EXTRAS_BANANO.map(e => e.id),
  banano_muslera: EXTRAS_BANANO.map(e => e.id),
};
