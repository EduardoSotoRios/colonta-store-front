// Al doble de la resolucion original (680x520) para que las plantillas se
// vean nitidas en vez de pixeladas — todo el resto del archivo escala solo
// porque usa estas constantes en lugar de numeros sueltos.
export const CANVAS_W = 1360;
export const CANVAS_H = 1040;

export function drawTemplateFromImage(
  img: HTMLImageElement,
  templateCanvas: HTMLCanvasElement,
  onDone: () => void,
): void {
  const templateCtx = templateCanvas.getContext('2d')!;
  templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);

  const render = () => {
    const tmp = document.createElement('canvas');
    tmp.width  = templateCanvas.width;
    tmp.height = templateCanvas.height;
    const tmpCtx = tmp.getContext('2d')!;

    const iw = img.naturalWidth  || 1080;
    const ih = img.naturalHeight || 1080;
    const canW = templateCanvas.width;
    const canH = templateCanvas.height;
    const margin = 80;
    const scale = Math.min((canW - margin) / iw, (canH - margin) / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (canW - dw) / 2, dy = (canH - dh) / 2;

    tmpCtx.imageSmoothingEnabled = true;
    tmpCtx.imageSmoothingQuality = 'high';
    tmpCtx.drawImage(img, dx, dy, dw, dh);

    // Make white/light background transparent; keep dark outlines.
    // Los pixeles que ya venian transparentes en el PNG original (alpha=0,
    // ej. plantillas exportadas sin fondo) se dejan como estan — si no, su
    // RGB en blanco (0,0,0) se leeria como luminosidad 0 y se pintarian
    // negro solido en vez de transparente.
    const imgData = tmpCtx.getImageData(0, 0, canW, canH);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      if (lum > 160) {
        data[i + 3] = 0;
      } else {
        data[i + 3] = Math.min(255, Math.round((1 - lum / 255) * 280));
      }
    }
    tmpCtx.putImageData(imgData, 0, 0);

    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    templateCtx.drawImage(tmp, 0, 0);
    onDone();
  };

  if (img.complete && img.naturalWidth > 0) {
    render();
  } else {
    img.onload = render;
  }
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

export function getMergedDataURL(
  colorCanvas: HTMLCanvasElement,
  templateCanvas: HTMLCanvasElement,
  productName: string,
): string {
  const merged = document.createElement('canvas');
  merged.width  = colorCanvas.width;
  merged.height = colorCanvas.height;
  const mctx = merged.getContext('2d')!;
  mctx.fillStyle = '#FFFFFF';
  mctx.fillRect(0, 0, merged.width, merged.height);
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
