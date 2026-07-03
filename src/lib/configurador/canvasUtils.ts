export const CANVAS_W = 680;
export const CANVAS_H = 520;

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
    const scale = Math.min((canW - 40) / iw, (canH - 40) / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (canW - dw) / 2, dy = (canH - dh) / 2;

    tmpCtx.drawImage(img, dx, dy, dw, dh);

    // Make white/light background transparent; keep dark outlines
    const imgData = tmpCtx.getImageData(0, 0, canW, canH);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
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
] as const;

const TEXTURE_TILE_SIZE = 110;
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

export function createFlowerPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
  const pc = document.createElement('canvas');
  pc.width = 30; pc.height = 30;
  const pctx = pc.getContext('2d')!;
  pctx.fillStyle = '#FFB6C1';
  pctx.fillRect(0, 0, 30, 30);
  ([[15, 10], [10, 20], [20, 20], [8, 13], [22, 13]] as [number, number][]).forEach(([px, py], i) => {
    pctx.beginPath();
    pctx.arc(px, py, 3.5, 0, Math.PI * 2);
    pctx.fillStyle = i === 0 ? '#FFD700' : '#FF69B4';
    pctx.fill();
  });
  return ctx.createPattern(pc, 'repeat')!;
}

interface FloodFillOptions {
  colorCanvas: HTMLCanvasElement;
  templateCanvas: HTMLCanvasElement;
  /** A COLORS `value` like 'pattern-leopardo', or null when painting a plain color. */
  activePattern: string | null;
  currentColor: string;
}

export function floodFill(startX: number, startY: number, opts: FloodFillOptions): void {
  const { colorCanvas, templateCanvas, activePattern, currentColor } = opts;
  const colorCtx = colorCanvas.getContext('2d')!;
  const templateCtx = templateCanvas.getContext('2d')!;
  const cw = colorCanvas.width, ch = colorCanvas.height;

  startX = Math.max(0, Math.min(cw - 1, Math.round(startX)));
  startY = Math.max(0, Math.min(ch - 1, Math.round(startY)));

  const imgData = colorCtx.getImageData(0, 0, cw, ch);
  const data = imgData.data;
  const idx = (startY * cw + startX) * 4;
  const startR = data[idx], startG = data[idx + 1], startB = data[idx + 2], startA = data[idx + 3];

  let fillR: number, fillG: number, fillB: number;
  if (activePattern === 'pattern-flores') {
    fillR = 255; fillG = 182; fillB = 193;
  } else if (activePattern) {
    [fillR, fillG, fillB] = TEXTURE_SENTINEL;
  } else {
    const hex = currentColor.replace('#', '');
    fillR = parseInt(hex.slice(0, 2), 16);
    fillG = parseInt(hex.slice(2, 4), 16);
    fillB = parseInt(hex.slice(4, 6), 16);
  }

  if (startR === fillR && startG === fillG && startB === fillB) return;

  const templateData = templateCtx.getImageData(0, 0, cw, ch).data;
  const isDarkOutline = (i: number) => templateData[i + 3] > 80;
  const colorMatch = (i: number) =>
    !isDarkOutline(i) &&
    Math.abs(data[i] - startR) < 50 &&
    Math.abs(data[i + 1] - startG) < 50 &&
    Math.abs(data[i + 2] - startB) < 50 &&
    Math.abs(data[i + 3] - startA) < 50;

  const queue = [startX + startY * cw];
  const visited = new Uint8Array(cw * ch);

  while (queue.length) {
    const pos = queue.pop()!;
    const x = pos % cw, y = Math.floor(pos / cw);
    if (x < 0 || x >= cw || y < 0 || y >= ch) continue;
    if (visited[pos]) continue;
    const i = pos * 4;
    if (!colorMatch(i)) continue;
    visited[pos] = 1;
    data[i] = fillR; data[i + 1] = fillG; data[i + 2] = fillB; data[i + 3] = 255;
    queue.push(pos + 1, pos - 1, pos + cw, pos - cw);
  }

  colorCtx.putImageData(imgData, 0, 0);

  if (activePattern) {
    const filled = colorCtx.getImageData(0, 0, cw, ch);
    const fd = filled.data;

    const maskC = document.createElement('canvas');
    maskC.width = cw; maskC.height = ch;
    const maskImg = new ImageData(cw, ch);
    for (let k = 0; k < fd.length; k += 4) {
      const hit = fd[k] === fillR && fd[k + 1] === fillG && fd[k + 2] === fillB && fd[k + 3] === 255;
      maskImg.data[k + 3] = hit ? 255 : 0;
    }
    maskC.getContext('2d')!.putImageData(maskImg, 0, 0);

    const patC = document.createElement('canvas');
    patC.width = cw; patC.height = ch;
    const pctx = patC.getContext('2d')!;
    const pattern = activePattern === 'pattern-flores'
      ? createFlowerPattern(pctx)
      : createTexturePattern(pctx, activePattern);
    pctx.fillStyle = pattern ?? `rgb(${TEXTURE_SENTINEL.join(',')})`;
    pctx.fillRect(0, 0, cw, ch);
    pctx.globalCompositeOperation = 'destination-in';
    pctx.drawImage(maskC, 0, 0);

    colorCtx.drawImage(patC, 0, 0);
  }
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
