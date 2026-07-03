export type ProductId =
  | 'mochila_normal'
  | 'mochila_ligera'
  | 'banano'
  | 'billetera'
  | 'bolso'
  | 'tabaquera'
  | 'banano_simple'
  | 'banano_muslera'
  | 'porta_matt';

export interface ProductInfo {
  id: ProductId;
  name: string;
  description: string;
  image: string;
}

// Iconos usados en los botones del selector (imágenes pequeñas ~100KB)
export const PRODUCT_THUMBNAILS: Record<ProductId, string> = {
  mochila_normal:  '/configurador/mochila.png',
  mochila_ligera:  '/configurador/mochila-ligera.png',
  banano:          '/configurador/banano.png',
  billetera:       '/configurador/billetera.png',
  bolso:           '/configurador/bolso.png',
  tabaquera:       '/configurador/tabaquera.png',
  banano_simple:   '/configurador/banano-simple.png',
  banano_muslera:  '/configurador/banano-mulera.png',
  porta_matt:      '/configurador/porta-matt.png',
};

// Plantillas de dibujo que se cargan en el canvas (line art para colorear)
export const PRODUCT_IMAGES: Record<ProductId, string> = {
  mochila_normal:  '/configurador/plantillas/mochila-ligera.png',
  mochila_ligera:  '/configurador/plantillas/mochila.png',
  banano:          '/configurador/plantillas/banano-mulera.png',
  billetera:       '/configurador/plantillas/billetera.png',
  bolso:           '/configurador/plantillas/bolso.png',
  tabaquera:       '/configurador/plantillas/tabaquera.png',
  banano_simple:   '/configurador/plantillas/banano.png',
  banano_muslera:  '/configurador/plantillas/banano-simple.png',
  porta_matt:      '/configurador/plantillas/porta-matt.png',
};

export const MOCHILA_TYPES: ProductInfo[] = [
  { id: 'mochila_normal', name: 'Normal', description: 'Modelo estándar',         image: '/configurador/mochila.png' },
  { id: 'mochila_ligera', name: 'Ligera', description: 'Ultraliviana y flexible', image: '/configurador/mochila-ligera.png' },
];

export const PRODUCT_LIST: Array<ProductInfo | { id: 'mochila'; name: string; description: string; image: string; isMochila: true }> = [
  { id: 'mochila',        name: 'Mochila',        description: 'Normal o Ligera',       image: '/configurador/mochila.png',       isMochila: true },
  { id: 'banano',         name: 'Banano',         description: 'Riñonera clásica',      image: '/configurador/banano.png' },
  { id: 'billetera',      name: 'Billetera',      description: 'Bifold clásica',        image: '/configurador/billetera.png' },
  { id: 'bolso',          name: 'Bolso Tote',     description: 'Para el día a día',     image: '/configurador/bolso.png' },
  { id: 'tabaquera',      name: 'Tabaquera',      description: 'Bolso tipo sobre',      image: '/configurador/tabaquera.png' },
  { id: 'banano_simple',  name: 'Banano Simple',  description: 'Sling bag cruzado',     image: '/configurador/banano-simple.png' },
  { id: 'banano_muslera', name: 'Banano Muslera', description: 'Riñonera tipo muslera', image: '/configurador/banano-mulera.png' },
  { id: 'porta_matt',     name: 'Porta Matt',     description: 'Porta colchoneta',      image: '/configurador/porta-matt.png' },
];

export const COLORS = [
  { name: 'Rojo',           value: '#E53935' },
  { name: 'Azul',           value: '#1565C0' },
  { name: 'Verde Petróleo', value: '#006064' },
  { name: 'Negro',          value: '#1A1A1A' },
  { name: 'Naranja',        value: '#E65100' },
  { name: 'Gris',           value: '#78909C' },
  { name: 'Rosa',           value: '#E91E8C' },
  { name: 'Morado',         value: '#7B2CBF' },
  { name: 'Flores',         value: 'pattern-flores' },
  { name: 'Leopardo',       value: 'pattern-leopardo' },
] as const;

export type ColorValue = typeof COLORS[number]['value'];
