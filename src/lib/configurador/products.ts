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
  | 'porta_notebook'
  | 'tote_nomada'
  | 'banano_pop'
  | 'bolso_cartera';

export interface ProductInfo {
  id: ProductId;
  name: string;
  description: string;
  image: string;
}

// Miniaturas usadas en los botones del selector de producto. Son imagenes
// independientes de la plantilla de dibujo (PRODUCT_IMAGES) a proposito: la
// plantilla se reprocesa con un algoritmo de luminosidad para el canvas, asi
// que si cambia (lineas mas finas, otra resolucion, etc.) no queremos que
// eso tambien cambie silenciosamente la miniatura del selector. Los
// productos que no tienen entrada aca (ej. banano_simple) usan la plantilla
// como respaldo — ver PRODUCT_LIST/MOCHILA_TYPES mas abajo.
export const PRODUCT_THUMBNAILS: Partial<Record<ProductId, string>> = {
  mochila_normal:  '/configurador/miniaturas/mochila-normal.png',
  mochila_ligera:  '/configurador/miniaturas/mochila-ligera.png',
  mochila_mini:    '/configurador/miniaturas/mochila-mini.png',
  banano:          '/configurador/miniaturas/banano.png',
  billetera:       '/configurador/miniaturas/billetera.png',
  bolso:           '/configurador/miniaturas/bolso.png',
  tabaquera:       '/configurador/miniaturas/tabaquera.png',
  banano_muslera:  '/configurador/miniaturas/banano-muslera.png',
  porta_matt:      '/configurador/miniaturas/porta-matt.png',
  roll_top:        '/configurador/miniaturas/roll-top.png',
  porta_notebook:  '/configurador/miniaturas/porta-notebook.png',
  tote_nomada:     '/configurador/miniaturas/tote-nomada.png',
  banano_pop:      '/configurador/miniaturas/banano-pop.png',
  bolso_cartera:   '/configurador/miniaturas/bolso-cartera.png',
};

// Plantillas de dibujo que se cargan en el canvas (line art para colorear).
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
  tote_nomada:     '/configurador/plantillas/tote-nomada.png',
  banano_pop:      '/configurador/plantillas/banano-pop.png',
  bolso_cartera:   '/configurador/plantillas/bolso-cartera.png',
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
  porta_matt:      { x: 670, y: 635, w: 120, h: 65 },
  tote_nomada:     { x: 595, y: 835, w: 130, h: 65 },
  banano_pop:      { x: 533, y: 670, w: 103, h: 45 },
  bolso_cartera:   { x: 835, y: 763, w: 120, h: 60 },
};

// Miniatura dedicada si existe, si no la plantilla de dibujo como respaldo.
function thumbnailFor(id: ProductId): string {
  return PRODUCT_THUMBNAILS[id] ?? PRODUCT_IMAGES[id];
}

export const MOCHILA_TYPES: ProductInfo[] = [
  { id: 'mochila_normal', name: 'Normal', description: 'Modelo estándar',         image: thumbnailFor('mochila_normal') },
  { id: 'mochila_ligera', name: 'Ligera', description: 'Ultraliviana y flexible', image: thumbnailFor('mochila_ligera') },
  { id: 'mochila_mini',   name: 'Mini',   description: 'Compacta y práctica',     image: thumbnailFor('mochila_mini') },
];

export const PRODUCT_LIST: Array<ProductInfo | { id: 'mochila'; name: string; description: string; image: string; isMochila: true }> = [
  { id: 'mochila',        name: 'Mochila',        description: 'Normal, Ligera o Mini', image: thumbnailFor('mochila_normal'),   isMochila: true },
  { id: 'banano',         name: 'Banano',         description: 'Riñonera clásica',      image: thumbnailFor('banano') },
  { id: 'billetera',      name: 'Billetera',      description: 'Bifold clásica',        image: thumbnailFor('billetera') },
  { id: 'bolso',          name: 'Bolso Tote',     description: 'Para el día a día',     image: thumbnailFor('bolso') },
  { id: 'tabaquera',      name: 'Tabaquera',      description: 'Bolso tipo sobre',      image: thumbnailFor('tabaquera') },
  { id: 'banano_simple',  name: 'Banano Simple',  description: 'Sling bag cruzado',     image: thumbnailFor('banano_simple') },
  { id: 'banano_muslera', name: 'Banano Muslera', description: 'Riñonera tipo muslera', image: thumbnailFor('banano_muslera') },
  { id: 'porta_matt',     name: 'Porta Matt',     description: 'Porta colchoneta',      image: thumbnailFor('porta_matt') },
  { id: 'roll_top',       name: 'Roll Top',       description: 'Cierre enrollable',     image: thumbnailFor('roll_top') },
  { id: 'porta_notebook', name: 'Porta Notebook', description: 'Funda para laptop',     image: thumbnailFor('porta_notebook') },
  { id: 'tote_nomada',    name: 'Tote Nómada',    description: 'Tote con bolsillos laterales', image: thumbnailFor('tote_nomada') },
  { id: 'banano_pop',     name: 'Banano Pop',     description: 'Riñonera compacta',     image: thumbnailFor('banano_pop') },
  { id: 'bolso_cartera',  name: 'Bolso Cartera',  description: 'Bolso cruzado tipo cartera', image: thumbnailFor('bolso_cartera') },
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
