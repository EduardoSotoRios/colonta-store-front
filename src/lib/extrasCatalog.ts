// ─── Extras estáticos por categoría ──────────────────────────────────────────
// IDs obtenidos del backend Railway al crear los extras (2026-07-23).
// El backend requiere auth para GET /models, así que usamos estos valores directamente.
// Al cambiar precios: actualizar precio en Railway Y en este objeto.
//
// Vive en su propio archivo (sin importar nada de Supabase/servidor) para que
// tanto api.ts (server) como componentes cliente del configurador puedan
// importar estos datos sin arrastrar codigo server-only al bundle del cliente.
export type ExtraEntry = { id: string; name: string; description: string; price: number; imageUrl?: string };

export const EX: Record<string, ExtraEntry> = {
  bolsilloEspalda:    { id: '5440afab-dfa5-4fca-9157-98293c2f1cef', name: 'Bolsillo Espalda',    description: '', price: 1000 },
  cintaMattYoga:      { id: 'c5fdf1a5-9c76-4364-8a28-e07d12787bcf', name: 'Cinta Matt Yoga',     description: '', price: 1000 },
  cintasSaco:         { id: '9984a38e-6763-4222-a1b4-5d4952d4a0b1', name: 'Cintas Saco',         description: '', price: 1000 },
  cintasReflectantes: { id: '54a9fec4-f2bc-44ad-b784-da6dc294b469', name: 'Cintas Reflectantes', description: '', price: 1000 },
  tipTopTapa:         { id: 'd1146736-17cd-4baf-b6c4-a3cf4ed868b8', name: '2 Tip top Tapa',      description: '', price: 1000 },
  cintasCintura:      { id: '41bf122b-872a-431b-96de-9bffabbbc472', name: 'Cintas Cintura',       description: '', price: 1000 },
  cintasPecho:        { id: 'db38b57c-a3e4-4fa0-9754-6a3fb4d648ae', name: 'Cintas Pecho',        description: '', price: 1000 },
  cintaReflectante:   { id: '05d0c15d-bb89-47d5-9fea-90f907dc1e72', name: 'Cinta Reflectante',   description: '', price: 1000 },
};

export const EXTRAS_MOCHILA_NORMAL = [EX.bolsilloEspalda, EX.cintaMattYoga, EX.cintasSaco, EX.cintasReflectantes, EX.tipTopTapa, EX.cintasCintura, EX.cintasPecho];
export const EXTRAS_MOCHILA_LIGERA = [EX.bolsilloEspalda, EX.cintasReflectantes];
export const EXTRAS_BANANO         = [EX.cintaReflectante];

export function extrasParaProducto(nombre: string, categoria_slug: string): ExtraEntry[] {
  if (categoria_slug === 'bananos') return EXTRAS_BANANO;
  if (categoria_slug === 'mochilas') {
    return nombre.toLowerCase().includes('ligera')
      ? EXTRAS_MOCHILA_LIGERA
      : EXTRAS_MOCHILA_NORMAL;
  }
  return [];
}
