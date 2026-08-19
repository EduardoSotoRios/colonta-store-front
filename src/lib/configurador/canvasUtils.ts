// Al doble de la resolucion original (680x520) para que las plantillas se
// vean nitidas en vez de pixeladas — todo el resto del archivo escala solo
// porque usa estas constantes en lugar de numeros sueltos.
export const CANVAS_W = 1360;
export const CANVAS_H = 1040;

// Umbral de tinta mas agresivo que un simple degradado lineal: cualquier
// trazo mas oscuro que INK_FLOOR llega a opacidad completa de una, y solo
// la franja entre INK_FLOOR y BG_CEILING se usa para el antialiasing
// suave del borde. Sin esto, una plantilla con lineas finas (donde el
// antialiasing ocupa la mayor parte del ancho del trazo, no solo el
// borde) terminaba con casi toda la linea semi-transparente en vez de
// solida, y se veia difusa/pixelada aunque el lienzo sea de alta
// resolucion.
const INK_FLOOR = 110;
const BG_CEILING = 160;

// Rectangulo (en el espacio de pixeles del canvas, CANVAS_W x CANVAS_H) que
// delimita un logo/texto fijo dentro de una plantilla — ver LOGO_REGIONS en
// products.ts.
export interface PixelRect { x: number; y: number; w: number; h: number; }

// Make white/light background transparent; keep dark outlines. Los pixeles
// que ya venian transparentes en el PNG original (alpha=0, ej. plantillas
// exportadas sin fondo) se dejan como estan — si no, su RGB en blanco (0,0,0)
// se leeria como luminosidad 0 y se pintarian negro solido en vez de
// transparente.
// Cuando hay protectRect, devuelve una mascara del tamaño del canvas
// marcando exactamente que pixeles son "el logo" (su tinta + su relleno
// blanco forzado) — ver drawTemplateFromImageWithTape, que la usa para que
// la deteccion de cinta no toque esos pixeles.
function applyInkAlpha(imgData: ImageData, protectRect?: PixelRect): Uint8Array | undefined {
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    if (lum > BG_CEILING) {
      data[i + 3] = 0;
    } else if (lum <= INK_FLOOR) {
      data[i + 3] = 255;
    } else {
      data[i + 3] = Math.round((1 - (lum - INK_FLOOR) / (BG_CEILING - INK_FLOOR)) * 255);
    }
  }
  return protectRect ? forceLogoWhite(imgData, protectRect) : undefined;
}

// El logo "Colonta" viene dibujado como texto blanco con borde negro. El
// relleno blanco de las letras es identico en color al fondo, asi que el
// calculo de arriba (que decide transparencia por luminosidad) no puede
// distinguirlos y termina "borrando" el texto junto con el fondo. `rect` solo
// acota la zona de busqueda (con margen de sobra alrededor del texto) — la
// forma real que se pinta blanca la decide un flood fill sembrado desde el
// borde de ese rectangulo, igual que buildProductMask separa "fuera del
// producto" de "encerrado por tinta": lo alcanzable desde el borde sin cruzar
// tinta es fondo de verdad (queda como estaba, transparente), y lo NO
// alcanzable (encerrado por el contorno de cada letra) es el relleno del
// texto, que se fuerza a blanco opaco. Asi el resultado sigue el contorno
// exacto de las letras en vez de pintar un cuadrado blanco parejo.
function forceLogoWhite(imgData: ImageData, rect: PixelRect): Uint8Array {
  const { data, width, height } = imgData;
  const mask = new Uint8Array(width * height);
  const x0 = Math.max(0, Math.round(rect.x));
  const y0 = Math.max(0, Math.round(rect.y));
  const x1 = Math.min(width, Math.round(rect.x + rect.w));
  const y1 = Math.min(height, Math.round(rect.y + rect.h));
  const rw = x1 - x0, rh = y1 - y0;
  if (rw <= 0 || rh <= 0) return mask;

  const isInk = (lx: number, ly: number) => {
    const i = ((y0 + ly) * width + (x0 + lx)) * 4;
    return data[i + 3] > 80;
  };

  const outside = new Uint8Array(rw * rh);
  const queue: number[] = [];
  const seed = (lx: number, ly: number) => {
    const p = ly * rw + lx;
    if (!outside[p] && !isInk(lx, ly)) { outside[p] = 1; queue.push(p); }
  };
  for (let lx = 0; lx < rw; lx++) { seed(lx, 0); seed(lx, rh - 1); }
  for (let ly = 0; ly < rh; ly++) { seed(0, ly); seed(rw - 1, ly); }

  let qi = 0;
  while (qi < queue.length) {
    const p = queue[qi++];
    const lx = p % rw, ly = (p / rw) | 0;
    if (lx > 0) seed(lx - 1, ly);
    if (lx < rw - 1) seed(lx + 1, ly);
    if (ly > 0) seed(lx, ly - 1);
    if (ly < rh - 1) seed(lx, ly + 1);
  }

  for (let ly = 0; ly < rh; ly++) {
    for (let lx = 0; lx < rw; lx++) {
      if (outside[ly * rw + lx]) continue; // fondo real, no es parte del logo
      const gx = x0 + lx, gy = y0 + ly;
      mask[gy * width + gx] = 1;
      if (isInk(lx, ly)) continue; // ya esta bien (tinta opaca), no tocar
      const i = (gy * width + gx) * 4;
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
    }
  }
  return mask;
}

function fitRect(iw: number, ih: number, canW: number, canH: number, margin = 80) {
  const scale = Math.min((canW - margin) / iw, (canH - margin) / ih);
  const dw = iw * scale, dh = ih * scale;
  const dx = (canW - dw) / 2, dy = (canH - dh) / 2;
  return { dw, dh, dx, dy };
}

function whenImageReady(img: HTMLImageElement, cb: () => void): void {
  if (img.complete && img.naturalWidth > 0) cb();
  else img.onload = cb;
}

export function drawTemplateFromImage(
  img: HTMLImageElement,
  templateCanvas: HTMLCanvasElement,
  onDone: () => void,
  protectRect?: PixelRect,
): void {
  const templateCtx = templateCanvas.getContext('2d')!;
  templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);

  const render = () => {
    const tmp = document.createElement('canvas');
    tmp.width  = templateCanvas.width;
    tmp.height = templateCanvas.height;
    const tmpCtx = tmp.getContext('2d')!;

    const canW = templateCanvas.width;
    const canH = templateCanvas.height;
    const { dw, dh, dx, dy } = fitRect(img.naturalWidth || 1080, img.naturalHeight || 1080, canW, canH);

    tmpCtx.imageSmoothingEnabled = true;
    tmpCtx.imageSmoothingQuality = 'high';
    tmpCtx.drawImage(img, dx, dy, dw, dh);

    const imgData = tmpCtx.getImageData(0, 0, canW, canH);
    applyInkAlpha(imgData, protectRect);
    tmpCtx.putImageData(imgData, 0, 0);

    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    templateCtx.drawImage(tmp, 0, 0);
    onDone();
  };

  whenImageReady(img, render);
}

// Suma de diferencias absolutas por canal (R+G+B, rango 0-765) a partir de la
// cual un pixel se considera "cinta reflectante" y no fondo/ruido de
// compresion JPEG. La cinta tiene brillos/reflejos casi blancos que difieren
// del fondo por muy pocas unidades — con un umbral alto (ej. 40) esas partes
// claras quedaban indistinguibles del fondo y se volvian transparentes en vez
// de opacas (se "comia" pedazos de cinta). Comparando las 9 plantillas reales
// con cinta, el fondo/ruido JPEG se mantiene siempre en 0 en zonas lejos de
// la cinta, asi que un umbral bajo como este sigue sin generar falsos
// positivos fuera de la franja.
const TAPE_DIFF_THRESHOLD = 12;

// Variante de drawTemplateFromImage para productos con version "con cinta
// reflectante": dibuja la plantilla normal (mismo algoritmo de siempre) y le
// superpone, ya opaca y con su color real, la franja de cinta — detectada
// comparando pixel a pixel contra la plantilla normal, ya que ambas imagenes
// comparten exactamente el mismo dibujo de lineas y solo difieren en la
// cinta. Al quedar la cinta "horneada" dentro de templateCanvas (la misma
// capa que ya se dibuja encima de colorCanvas en cada render), el lapiz y el
// borrador — que solo tocan colorCanvas — nunca pueden pintarla ni borrarla.
export function drawTemplateFromImageWithTape(
  normalImg: HTMLImageElement,
  tapeImg: HTMLImageElement,
  templateCanvas: HTMLCanvasElement,
  onDone: () => void,
  protectRect?: PixelRect,
): void {
  const templateCtx = templateCanvas.getContext('2d')!;
  templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);

  const render = () => {
    const canW = templateCanvas.width;
    const canH = templateCanvas.height;
    const { dw, dh, dx, dy } = fitRect(
      normalImg.naturalWidth || 1080,
      normalImg.naturalHeight || 1080,
      canW, canH,
    );

    // Capa base: la plantilla normal ya procesada (fondo transparente, tinta
    // opaca), exactamente igual que drawTemplateFromImage.
    const baseC = document.createElement('canvas');
    baseC.width = canW; baseC.height = canH;
    const baseCtx = baseC.getContext('2d')!;
    baseCtx.imageSmoothingEnabled = true;
    baseCtx.imageSmoothingQuality = 'high';
    baseCtx.drawImage(normalImg, dx, dy, dw, dh);
    const baseData = baseCtx.getImageData(0, 0, canW, canH);
    const logoMask = applyInkAlpha(baseData, protectRect);

    // Dos copias "aplanadas" sobre blanco (solo para comparar colores): sin
    // esto, si la plantilla normal viene con fondo realmente transparente,
    // su RGB debajo del alpha=0 puede ser cualquier basura y se leeria como
    // "distinto" del blanco de la foto de la cinta en todo el fondo, no solo
    // en la cinta.
    const flatNormal = document.createElement('canvas');
    flatNormal.width = canW; flatNormal.height = canH;
    const flatNormalCtx = flatNormal.getContext('2d')!;
    flatNormalCtx.fillStyle = '#FFFFFF';
    flatNormalCtx.fillRect(0, 0, canW, canH);
    flatNormalCtx.imageSmoothingEnabled = true;
    flatNormalCtx.imageSmoothingQuality = 'high';
    flatNormalCtx.drawImage(normalImg, dx, dy, dw, dh);
    const flatNormalData = flatNormalCtx.getImageData(0, 0, canW, canH).data;

    const tapeC = document.createElement('canvas');
    tapeC.width = canW; tapeC.height = canH;
    const tapeCtx = tapeC.getContext('2d')!;
    tapeCtx.fillStyle = '#FFFFFF';
    tapeCtx.fillRect(0, 0, canW, canH);
    tapeCtx.imageSmoothingEnabled = true;
    tapeCtx.imageSmoothingQuality = 'high';
    tapeCtx.drawImage(tapeImg, dx, dy, dw, dh);
    const tapeData = tapeCtx.getImageData(0, 0, canW, canH).data;

    // El logo tambien esta dibujado dentro de la foto de la cinta (misma
    // posicion), pero al ser un JPEG el ruido de compresion justo en el
    // borde de las letras alcanza a superar TAPE_DIFF_THRESHOLD y el logo
    // terminaba con un borde/halo pintado con esos colores de ruido en vez
    // de quedar limpio. Esa zona ya la resuelve por completo
    // applyInkAlpha+forceLogoWhite arriba, asi que la cinta no debe tocarla —
    // pero solo los pixeles del logo en si (logoMask), no todo protectRect:
    // la cinta real suele meterse dentro de ese rectangulo de busqueda (el
    // texto y la franja quedan cerca), y excluir el rectangulo entero le
    // dejaba un hueco cuadrado a la cinta en vez de la franja continua.
    const out = baseData;
    const outData = out.data;
    for (let i = 0; i < outData.length; i += 4) {
      if (logoMask && logoMask[i / 4]) continue;
      const diff = Math.abs(flatNormalData[i] - tapeData[i])
                 + Math.abs(flatNormalData[i + 1] - tapeData[i + 1])
                 + Math.abs(flatNormalData[i + 2] - tapeData[i + 2]);
      if (diff > TAPE_DIFF_THRESHOLD) {
        outData[i]     = tapeData[i];
        outData[i + 1] = tapeData[i + 1];
        outData[i + 2] = tapeData[i + 2];
        outData[i + 3] = 255;
      }
    }

    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    templateCtx.putImageData(out, 0, 0);
    onDone();
  };

  let pending = 2;
  const tryRender = () => { if (--pending === 0) render(); };
  whenImageReady(normalImg, tryRender);
  whenImageReady(tapeImg, tryRender);
}

// Image-backed "tela" patterns. Each `value` must match a COLORS entry and
// follows the `pattern-<slug>` convention, whose texture lives at
// `/configurador/patterns/<slug>.png` (used by both the swatch CSS and here).
export const TEXTURE_PATTERN_VALUES = [
  'pattern-leopardo',
  'pattern-leopardo-rosa',
  'pattern-corazones',
  'pattern-girasoles',
  'pattern-manchas',
  'pattern-circulos-retro',
  'pattern-cintas-color',
] as const;

const TEXTURE_TILE_SIZE = 220; // al doble junto con CANVAS_W/H, mismo tamaño relativo de mosaico
// Placeholder color painted into the flood-fill mask before the real tiled
// texture is composited over it — never visible once a texture is ready.
const TEXTURE_SENTINEL: [number, number, number] = [17, 17, 17];

const patternImgCache = new Map<string, HTMLImageElement>();

function textureSrc(value: string): string {
  return `/configurador/patterns/${value.replace('pattern-', '')}.png`;
}

export function preloadPatternTextures(): void {
  TEXTURE_PATTERN_VALUES.forEach(value => {
    if (!patternImgCache.has(value)) {
      const img = new Image();
      img.src = textureSrc(value);
      patternImgCache.set(value, img);
    }
  });
}

export function isTexturePattern(value: string): boolean {
  return (TEXTURE_PATTERN_VALUES as readonly string[]).includes(value);
}

// Returns null while the source image is still loading — callers should
// fall back to a plain color in that case so painting never breaks.
export function createTexturePattern(ctx: CanvasRenderingContext2D, value: string): CanvasPattern | null {
  preloadPatternTextures();
  const img = patternImgCache.get(value);
  if (!img || !img.complete || img.naturalWidth === 0) return null;
  const pc = document.createElement('canvas');
  pc.width = TEXTURE_TILE_SIZE; pc.height = TEXTURE_TILE_SIZE;
  const pctx = pc.getContext('2d')!;
  pctx.drawImage(img, 0, 0, TEXTURE_TILE_SIZE, TEXTURE_TILE_SIZE);
  return ctx.createPattern(pc, 'repeat')!;
}

// Each flood-fill claims the pixels it paints under a fresh numeric "zone" id
// (0 = never painted). A later fill can only spread across pixels that share
// its start pixel's zone — this is what actually decides "same region", not
// pixel color. Without it, a high-contrast texture (e.g. black spots on white,
// like "Manchas") gets its light pixels silently swallowed by an unrelated
// fill in a neighboring area, because those light pixels look color-similar
// to plain unpainted canvas even though they belong to a different pattern.
let zoneCounter = 1;

export function createZoneMap(width: number, height: number): Int32Array {
  return new Int32Array(width * height);
}

interface FloodFillOptions {
  colorCanvas: HTMLCanvasElement;
  templateCanvas: HTMLCanvasElement;
  /** A COLORS `value` like 'pattern-leopardo', or null when painting a plain color. */
  activePattern: string | null;
  currentColor: string;
  zoneMap: Int32Array;
  /** From `buildProductMask`. 0 = fuera del producto. Si el click de inicio cae
   *  ahí, el fill no hace nada; también actúa como tope extra durante el BFS. */
  productMask?: Uint8Array;
}

export function floodFill(startX: number, startY: number, opts: FloodFillOptions): void {
  const { colorCanvas, templateCanvas, activePattern, currentColor, zoneMap, productMask } = opts;
  const colorCtx = colorCanvas.getContext('2d')!;
  const templateCtx = templateCanvas.getContext('2d')!;
  const cw = colorCanvas.width, ch = colorCanvas.height;

  startX = Math.max(0, Math.min(cw - 1, Math.round(startX)));
  startY = Math.max(0, Math.min(ch - 1, Math.round(startY)));

  const imgData = colorCtx.getImageData(0, 0, cw, ch);
  const data = imgData.data;
  const startPos = startY * cw + startX;
  if (productMask && productMask[startPos] === 0) return;
  const startZone = zoneMap[startPos];

  let fillR: number, fillG: number, fillB: number;
  if (activePattern) {
    [fillR, fillG, fillB] = TEXTURE_SENTINEL;
  } else {
    const hex = currentColor.replace('#', '');
    fillR = parseInt(hex.slice(0, 2), 16);
    fillG = parseInt(hex.slice(2, 4), 16);
    fillB = parseInt(hex.slice(4, 6), 16);
  }

  const templateData = templateCtx.getImageData(0, 0, cw, ch).data;
  const isDarkOutline = (i: number) => templateData[i + 3] > 80;

  // Which pixels belong to "this" fill is decided purely by zoneMap equality
  // (plus the template outline). We deliberately do NOT also require the pixel
  // color to be close to the start pixel: once zone-gated, that extra check
  // only hurts — re-filling an existing textured region (whose pixels can be
  // any color, e.g. the black spots of "Manchas") must grab the whole region,
  // not just the sub-pixels that happen to resemble the exact spot clicked.
  const queue = [startPos];
  const visited = new Uint8Array(cw * ch);
  const newZone = zoneCounter++;
  let filledAny = false;

  while (queue.length) {
    const pos = queue.pop()!;
    const x = pos % cw, y = Math.floor(pos / cw);
    if (x < 0 || x >= cw || y < 0 || y >= ch) continue;
    if (visited[pos]) continue;
    if (zoneMap[pos] !== startZone) continue;
    if (productMask && productMask[pos] === 0) continue;
    const i = pos * 4;
    if (isDarkOutline(i)) continue;
    visited[pos] = 1;
    zoneMap[pos] = newZone;
    data[i] = fillR; data[i + 1] = fillG; data[i + 2] = fillB; data[i + 3] = 255;
    filledAny = true;
    queue.push(pos + 1, pos - 1, pos + cw, pos - cw);
  }

  if (!filledAny) return;

  colorCtx.putImageData(imgData, 0, 0);

  if (activePattern) {
    // Mask is built from zoneMap (authoritative, unambiguous) rather than from
    // pixel color: a fixed sentinel color can coincidentally match real,
    // anti-aliased texture pixels from an earlier fill elsewhere on the
    // canvas, which would otherwise leak that unrelated area into this mask.
    const maskC = document.createElement('canvas');
    maskC.width = cw; maskC.height = ch;
    const maskImg = new ImageData(cw, ch);
    for (let pos = 0; pos < cw * ch; pos++) {
      maskImg.data[pos * 4 + 3] = zoneMap[pos] === newZone ? 255 : 0;
    }
    maskC.getContext('2d')!.putImageData(maskImg, 0, 0);

    const patC = document.createElement('canvas');
    patC.width = cw; patC.height = ch;
    const pctx = patC.getContext('2d')!;
    const pattern = createTexturePattern(pctx, activePattern);
    pctx.fillStyle = pattern ?? `rgb(${TEXTURE_SENTINEL.join(',')})`;
    pctx.fillRect(0, 0, cw, ch);
    pctx.globalCompositeOperation = 'destination-in';
    pctx.drawImage(maskC, 0, 0);

    colorCtx.drawImage(patC, 0, 0);
  }
}

// Marca qué píxeles del canvas pertenecen a la silueta del producto (interior
// + contorno) vs. el fondo fuera de ella, para poder confinar ahí el pintado
// (lápiz y relleno) sin depender únicamente del zoneMap. Se calcula con un
// flood fill sembrado desde los bordes del canvas: todo lo alcanzable desde
// un borde sin cruzar un píxel de contorno es "afuera"; el resto (el propio
// contorno + regiones interiores cerradas, como tirantes o bolsillos) es
// "adentro" y por lo tanto pintable.
export function buildProductMask(templateCanvas: HTMLCanvasElement): { mask: Uint8Array; maskCanvas: HTMLCanvasElement } {
  const w = templateCanvas.width, h = templateCanvas.height;
  const ctx = templateCanvas.getContext('2d')!;
  const data = ctx.getImageData(0, 0, w, h).data;
  const isOutline = (pos: number) => data[pos * 4 + 3] > 80;

  const outside = new Uint8Array(w * h);
  const queue: number[] = [];
  const seed = (pos: number) => {
    if (!outside[pos] && !isOutline(pos)) { outside[pos] = 1; queue.push(pos); }
  };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + (w - 1)); }

  let qi = 0;
  while (qi < queue.length) {
    const pos = queue[qi++];
    const x = pos % w;
    if (x > 0) seed(pos - 1);
    if (x < w - 1) seed(pos + 1);
    if (pos - w >= 0) seed(pos - w);
    if (pos + w < w * h) seed(pos + w);
  }

  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = outside[i] ? 0 : 1;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w; maskCanvas.height = h;
  const mctx = maskCanvas.getContext('2d')!;
  const maskImg = mctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) maskImg.data[i * 4 + 3] = mask[i] ? 255 : 0;
  mctx.putImageData(maskImg, 0, 0);

  return { mask, maskCanvas };
}

// Patron de cuadros gris/gris oscuro (el mismo lenguaje visual que Photoshop
// o Figma usan para "transparente") que se muestra SOLO en el lienzo en
// vivo del editor donde todavia no se pinto nada, para poder distinguir
// "sin pintar" de "pintado de blanco a proposito" — ambos casos antes se
// veian identicos porque el lienzo de pintura arrancaba blanco solido.
// getMergedDataURL (arriba) sigue usando blanco solido de fondo: la imagen
// final que se descarga/agrega al carrito nunca debe llevar este patron,
// solo representa "sin decidir todavia" mientras se esta diseñando.
const CHECKER_SIZE = 24;
let checkerTile: HTMLCanvasElement | null = null;

function getCheckerTile(): HTMLCanvasElement {
  if (checkerTile) return checkerTile;
  const tile = document.createElement('canvas');
  tile.width = CHECKER_SIZE * 2;
  tile.height = CHECKER_SIZE * 2;
  const tctx = tile.getContext('2d')!;
  tctx.fillStyle = '#e4e4e4';
  tctx.fillRect(0, 0, CHECKER_SIZE * 2, CHECKER_SIZE * 2);
  tctx.fillStyle = '#bcbcbc';
  tctx.fillRect(0, 0, CHECKER_SIZE, CHECKER_SIZE);
  tctx.fillRect(CHECKER_SIZE, CHECKER_SIZE, CHECKER_SIZE, CHECKER_SIZE);
  checkerTile = tile;
  return tile;
}

export function createCheckerboardPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
  return ctx.createPattern(getCheckerTile(), 'repeat')!;
}

export function getMergedDataURL(
  colorCanvas: HTMLCanvasElement,
  templateCanvas: HTMLCanvasElement,
  productName: string,
): string {
  // Sin relleno blanco de fondo: colorCanvas ya es transparente donde el
  // cliente no pinto nada (ver CanvasDesigner), asi que el PNG final
  // conserva esa transparencia real. Esto es lo que la empresa necesita
  // para fabricar el producto — poder distinguir "el cliente eligio blanco
  // a proposito" (blanco solido) de "no eligio nada aca" (transparente),
  // en vez de que ambos casos queden identicos como blanco solido.
  const merged = document.createElement('canvas');
  merged.width  = colorCanvas.width;
  merged.height = colorCanvas.height;
  const mctx = merged.getContext('2d')!;
  mctx.drawImage(colorCanvas, 0, 0);
  mctx.drawImage(templateCanvas, 0, 0);
  return merged.toDataURL('image/png');
}

export function downloadCanvas(dataURL: string, productName: string): void {
  const link = document.createElement('a');
  link.download = `diseño-${productName.toLowerCase().replace(/ /g, '-')}.png`;
  link.href = dataURL;
  link.click();
}
