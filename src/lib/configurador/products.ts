import type { PixelRect } from './canvasUtils';

export type ProductId =
  | 'mochila_normal'
  | 'mochila_ligera'
  | 'mochila_mini'
  | 'banano'
  | 'billetera'
  | 'bolso'
  | 'tabaquera'
  | 'banano_simple'
  | 'banano_muslera'
  | 'porta_matt'
  | 'roll_top'
  | 'porta_notebook';

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
  mochila_mini:    '/configurador/mochila-mini.png',
  banano:          '/configurador/banano.png',
  billetera:       '/configurador/billetera.png',
  bolso:           '/configurador/bolso.png',
  tabaquera:       '/configurador/tabaquera.png',
  banano_simple:   '/configurador/banano-simple.png',
  banano_muslera:  '/configurador/banano-mulera.png',
  porta_matt:      '/configurador/porta-matt.png',
  roll_top:        '/configurador/roll-top.png',
  porta_notebook:  '/configurador/porta-notebook.png',
};

// Plantillas de dibujo que se cargan en el canvas (line art para colorear)
export const PRODUCT_IMAGES: Record<ProductId, string> = {
  mochila_normal:  '/configurador/plantillas/mochila-ligera.png',
  mochila_ligera:  '/configurador/plantillas/mochila.png',
  mochila_mini:    '/configurador/plantillas/mochila-mini.png',
  banano:          '/configurador/plantillas/banano-mulera.png',
  billetera:       '/configurador/plantillas/billetera.png',
  bolso:           '/configurador/plantillas/bolso.png',
  tabaquera:       '/configurador/plantillas/tabaquera.png',
  banano_simple:   '/configurador/plantillas/banano.png',
  banano_muslera:  '/configurador/plantillas/banano-simple.png',
  porta_matt:      '/configurador/plantillas/porta-matt.png',
  roll_top:        '/configurador/plantillas/roll-top.png',
  porta_notebook:  '/configurador/plantillas/porta-notebook.png',
};

// Version "con cinta reflectante" de la plantilla de dibujo, solo para los
// productos que la tienen disponible (los demas no aparecen aca y el
// configurador no muestra la opcion de elegir cinta para ellos). El diseño
// de linea es identico al de PRODUCT_IMAGES — solo se le agrega una franja
// de cinta reflectante — asi que CanvasDesigner puede comparar ambas
// imagenes pixel a pixel para saber exactamente donde va la cinta.
export const PRODUCT_IMAGES_CINTA: Partial<Record<ProductId, string>> = {
  mochila_normal:  '/configurador/plantillas-cinta/mochila-normal.jpg',
  mochila_ligera:  '/configurador/plantillas-cinta/mochila-ligera.jpg',
  mochila_mini:    '/configurador/plantillas-cinta/mochila-mini.jpg',
  banano:          '/configurador/plantillas-cinta/banano.jpg',
  banano_simple:   '/configurador/plantillas-cinta/banano-simple.jpg',
  bolso:           '/configurador/plantillas-cinta/bolso.jpg',
  tabaquera:       '/configurador/plantillas-cinta/tabaquera.jpg',
  roll_top:        '/configurador/plantillas-cinta/roll-top.jpg',
  porta_notebook:  '/configurador/plantillas-cinta/porta-notebook.jpg',
};

// Rectangulo (en pixeles de CANVAS_W x CANVAS_H) que delimita el logo
// "Colonta" dentro de cada plantilla — viene dibujado como texto blanco con
// borde negro, y como el relleno blanco es igual de color al fondo, el
// algoritmo de transparencia normal lo borra junto con el fondo real. Estas
// coordenadas le dicen a drawTemplateFromImage/WithTape donde forzar blanco
// opaco en vez de transparente. Se calibran una vez por plantilla (ubicando
// el bloque de pixeles "encerrado" por tinta, igual que buildProductMask, y
// confirmando visualmente que es el texto y no otro elemento chico cercano
// como una hebilla o una asa) y no cambian salvo que se reemplace la imagen.
// Porta Matt no tiene entrada: su plantilla no trae el texto blanco con
// borde negro (el unico elemento chico ahi es un rectangulo negro solido),
// asi que no sufre este problema.
export const LOGO_REGIONS: Partial<Record<ProductId, PixelRect>> = {
  porta_notebook:  { x: 630, y: 335, w: 150, h: 65 },
  tabaquera:       { x: 570, y: 372, w: 220, h: 100 },
  mochila_normal:  { x: 610, y: 250, w: 150, h: 75 },
  mochila_ligera:  { x: 600, y: 190, w: 150, h: 75 },
  mochila_mini:    { x: 600, y: 280, w: 150, h: 75 },
  banano:          { x: 595, y: 605, w: 135, h: 70 },
  banano_simple:   { x: 590, y: 512, w: 170, h: 85 },
  banano_muslera:  { x: 570, y: 582, w: 175, h: 85 },
  bolso:           { x: 700, y: 745, w: 160, h: 115 },
  roll_top:        { x: 750, y: 815, w: 115, h: 75 },
  billetera:       { x: 555, y: 450, w: 235, h: 105 },
};

export const MOCHILA_TYPES: ProductInfo[] = [
  { id: 'mochila_normal', name: 'Normal', description: 'Modelo estándar',         image: '/configurador/mochila.png' },
  { id: 'mochila_ligera', name: 'Ligera', description: 'Ultraliviana y flexible', image: '/configurador/mochila-ligera.png' },
  { id: 'mochila_mini',   name: 'Mini',   description: 'Compacta y práctica',     image: '/configurador/mochila-mini.png' },
];

export const PRODUCT_LIST: Array<ProductInfo | { id: 'mochila'; name: string; description: string; image: string; isMochila: true }> = [
  { id: 'mochila',        name: 'Mochila',        description: 'Normal, Ligera o Mini', image: '/configurador/mochila.png',       isMochila: true },
  { id: 'banano',         name: 'Banano',         description: 'Riñonera clásica',      image: '/configurador/banano.png' },
  { id: 'billetera',      name: 'Billetera',      description: 'Bifold clásica',        image: '/configurador/billetera.png' },
  { id: 'bolso',          name: 'Bolso Tote',     description: 'Para el día a día',     image: '/configurador/bolso.png' },
  { id: 'tabaquera',      name: 'Tabaquera',      description: 'Bolso tipo sobre',      image: '/configurador/tabaquera.png' },
  { id: 'banano_simple',  name: 'Banano Simple',  description: 'Sling bag cruzado',     image: '/configurador/banano-simple.png' },
  { id: 'banano_muslera', name: 'Banano Muslera', description: 'Riñonera tipo muslera', image: '/configurador/banano-mulera.png' },
  { id: 'porta_matt',     name: 'Porta Matt',     description: 'Porta colchoneta',      image: '/configurador/porta-matt.png' },
  { id: 'roll_top',       name: 'Roll Top',       description: 'Cierre enrollable',     image: '/configurador/roll-top.png' },
  { id: 'porta_notebook', name: 'Porta Notebook', description: 'Funda para laptop',     image: '/configurador/porta-notebook.png' },
];

export const COLORS = [
  { name: 'Rojo',           value: '#E53935' },
  { name: 'Azul',           value: '#1565C0' },
  { name: 'Verde Petróleo', value: '#006064' },
  { name: 'Negro',          value: '#1A1A1A' },
  { name: 'Blanco',         value: '#FFFFFF' },
  { name: 'Naranja',        value: '#E65100' },
  { name: 'Gris',           value: '#78909C' },
  { name: 'Rosa',           value: '#E91E8C' },
  { name: 'Morado',         value: '#7B2CBF' },
  { name: 'Calipso',        value: '#0077A3' },
  { name: 'Celeste',        value: '#4FC3F7' },
  { name: 'Amarillo',       value: '#FFD600' },
  { name: 'Turquesa',       value: '#1CD3C4' },
  { name: 'Burdeo',         value: '#6E1423' },
  { name: 'Leopardo',       value: 'pattern-leopardo' },
  { name: 'Leopardo Rosa',  value: 'pattern-leopardo-rosa' },
  { name: 'Corazones',      value: 'pattern-corazones' },
  { name: 'Girasoles',      value: 'pattern-girasoles' },
  { name: 'Manchas',        value: 'pattern-manchas' },
  { name: 'Círculos Retro', value: 'pattern-circulos-retro' },
  { name: 'Cintas Color',   value: 'pattern-cintas-color' },
] as const;

export type ColorValue = typeof COLORS[number]['value'];
