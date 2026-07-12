'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  CANVAS_W, CANVAS_H,
  drawTemplateFromImage,
  floodFill,
  createTexturePattern,
  preloadPatternTextures,
  isTexturePattern,
  createZoneMap,
  getMergedDataURL,
  downloadCanvas,
} from '@/lib/configurador/canvasUtils';
import { PRODUCT_IMAGES, COLORS, type ProductId } from '@/lib/configurador/products';

type Tool = 'pencil' | 'fill' | 'eraser';

const SOLID_COLORS = COLORS.filter(c => !c.value.startsWith('pattern-'));
const TELA_COLORS  = COLORS.filter(c => c.value.startsWith('pattern-'));

interface CanvasDesignerProps {
  product: ProductId;
  productName: string;
  onContinue: (dataURL: string) => void;
  onBack: () => void;
}

export default function CanvasDesigner({ product, productName, onContinue, onBack }: CanvasDesignerProps) {
  const mainCanvasRef    = useRef<HTMLCanvasElement>(null);
  const colorCanvasRef   = useRef<HTMLCanvasElement | null>(null);
  const templateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoneMapRef       = useRef<Int32Array | null>(null);
  const historyRef       = useRef<ImageData[]>([]);
  const isDrawingRef     = useRef(false);
  const lastPosRef       = useRef({ x: 0, y: 0 });

  const [tool, setToolState]   = useState<Tool>('pencil');
  const [brushSize, setBrushSize] = useState(8);
  const [color, setColor]      = useState('#E53935');
  // A COLORS `value` like 'pattern-leopardo', or null when painting a plain color.
  const [activePattern, setActivePattern] = useState<string | null>(null);
  const [toast, setToast]      = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const toolRef      = useRef<Tool>('pencil');
  const colorRef     = useRef('#E53935');
  const patternRef   = useRef<string | null>(null);
  const brushRef     = useRef(8);

  // Keep refs in sync with state (needed inside event handlers)
  const syncRefs = useCallback((t: Tool, c: string, pat: string | null, b: number) => {
    toolRef.current    = t;
    colorRef.current   = c;
    patternRef.current = pat;
    brushRef.current   = b;
  }, []);

  useEffect(() => { syncRefs(tool, color, activePattern, brushSize); }, [tool, color, activePattern, brushSize, syncRefs]);

  useEffect(() => { preloadPatternTextures(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  // ── Render composite ──────────────────────────────────────────────────────
  const renderComposite = useCallback(() => {
    const main = mainCanvasRef.current;
    const col  = colorCanvasRef.current;
    const tpl  = templateCanvasRef.current;
    if (!main || !col || !tpl) return;
    const ctx = main.getContext('2d')!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(col, 0, 0);
    ctx.drawImage(tpl, 0, 0);
  }, []);

  function saveHistory() {
    const col = colorCanvasRef.current;
    if (!col) return;
    const ctx = col.getContext('2d')!;
    if (historyRef.current.length > 30) historyRef.current.shift();
    historyRef.current.push(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
  }

  // ── Initialize canvas when product changes ─────────────────────────────
  useEffect(() => {
    const colorCanvas    = document.createElement('canvas');
    colorCanvas.width    = CANVAS_W;
    colorCanvas.height   = CANVAS_H;
    colorCanvasRef.current = colorCanvas;

    const templateCanvas    = document.createElement('canvas');
    templateCanvas.width    = CANVAS_W;
    templateCanvas.height   = CANVAS_H;
    templateCanvasRef.current = templateCanvas;

    zoneMapRef.current = createZoneMap(CANVAS_W, CANVAS_H);

    const colorCtx = colorCanvas.getContext('2d')!;
    colorCtx.fillStyle = '#FFFFFF';
    colorCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    historyRef.current = [];

    const img = new Image();
    img.src = PRODUCT_IMAGES[product];
    drawTemplateFromImage(img, templateCanvas, () => {
      renderComposite();
      saveHistory();
    });
  }, [product, renderComposite]);

  // ── Position helper ─────────────────────────────────────────────────────
  function getPos(e: MouseEvent | TouchEvent) {
    const canvas = mainCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const src = 'touches' in e ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  function getDrawFill(): string | CanvasPattern {
    const col = colorCanvasRef.current;
    if (!col) return colorRef.current;
    const ctx = col.getContext('2d')!;
    const pattern = patternRef.current;
    if (pattern) return createTexturePattern(ctx, pattern) ?? colorRef.current;
    return colorRef.current;
  }

  // ── Drawing events ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const col = colorCanvasRef.current;
      const tpl = templateCanvasRef.current;
      const zones = zoneMapRef.current;
      if (!col || !tpl || !zones) return;
      const pos = getPos(e);

      if (toolRef.current === 'fill') {
        floodFill(pos.x, pos.y, {
          colorCanvas: col,
          templateCanvas: tpl,
          activePattern: patternRef.current,
          currentColor: colorRef.current,
          zoneMap: zones,
        });
        renderComposite();
        saveHistory();
        return;
      }

      isDrawingRef.current = true;
      lastPosRef.current = pos;
      const ctx = col.getContext('2d')!;
      const size = toolRef.current === 'eraser' ? brushRef.current * 2 : brushRef.current;
      ctx.beginPath();
      ctx.fillStyle = toolRef.current === 'eraser' ? '#FFFFFF' : getDrawFill() as string;
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      renderComposite();
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const col = colorCanvasRef.current;
      if (!col) return;
      const pos = getPos(e);
      const ctx = col.getContext('2d')!;
      const size = toolRef.current === 'eraser' ? brushRef.current * 2 : brushRef.current;
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = toolRef.current === 'eraser' ? '#FFFFFF' : getDrawFill() as string;
      ctx.lineWidth  = size;
      ctx.lineCap    = 'round';
      ctx.lineJoin   = 'round';
      ctx.stroke();
      lastPosRef.current = pos;
      renderComposite();
    };

    const onUp = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        saveHistory();
      }
    };

    canvas.addEventListener('mousedown', onDown as EventListener);
    canvas.addEventListener('mousemove', onMove as EventListener);
    canvas.addEventListener('mouseup',   onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('touchstart', onDown as EventListener, { passive: false });
    canvas.addEventListener('touchmove',  onMove as EventListener, { passive: false });
    canvas.addEventListener('touchend',   onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown as EventListener);
      canvas.removeEventListener('mousemove', onMove as EventListener);
      canvas.removeEventListener('mouseup',   onUp);
      canvas.removeEventListener('mouseleave', onUp);
      canvas.removeEventListener('touchstart', onDown as EventListener);
      canvas.removeEventListener('touchmove',  onMove as EventListener);
      canvas.removeEventListener('touchend',   onUp);
    };
  }, [renderComposite]);

  // ── Actions ─────────────────────────────────────────────────────────────
  function undoLast() {
    const col = colorCanvasRef.current;
    if (!col || historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const ctx = col.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    renderComposite();
    showToast('Acción deshecha');
  }

  function clearCanvas() {
    if (!confirm('¿Limpiar el diseño y volver a la plantilla?')) return;
    const col = colorCanvasRef.current;
    if (!col) return;
    const ctx = col.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    zoneMapRef.current = createZoneMap(CANVAS_W, CANVAS_H);
    renderComposite();
    historyRef.current = [];
    saveHistory();
    showToast('Diseño limpiado');
  }

  function handleContinue() {
    const col = colorCanvasRef.current;
    const tpl = templateCanvasRef.current;
    if (!col || !tpl) return;
    onContinue(getMergedDataURL(col, tpl, productName));
  }

  function handleDownload() {
    const col = colorCanvasRef.current;
    const tpl = templateCanvasRef.current;
    if (!col || !tpl) return;
    downloadCanvas(getMergedDataURL(col, tpl, productName), productName);
    showToast('Imagen descargada');
  }

  function selectColor(value: string) {
    if (value.startsWith('pattern-')) {
      setActivePattern(value);
    } else {
      setColor(value);
      setActivePattern(null);
    }
  }

  function selectTool(t: Tool) {
    setToolState(t);
  }

  function renderSwatch(c: { name: string; value: string }) {
    const isSelected = c.value.startsWith('pattern-')
      ? activePattern === c.value
      : (!activePattern && color === c.value);

    let swatchStyle: React.CSSProperties = {};
    if (isTexturePattern(c.value)) {
      swatchStyle = {
        backgroundImage: `url('/configurador/patterns/${c.value.replace('pattern-', '')}.png')`,
        backgroundSize: '200%',
        backgroundPosition: 'center',
      };
    } else {
      swatchStyle = { backgroundColor: c.value };
    }

    return (
      <div key={c.name} className="relative group">
        <button
          title={c.name}
          onClick={() => selectColor(c.value)}
          style={swatchStyle}
          className={`w-full aspect-square rounded-xl border-[3px] transition-transform hover:scale-110
            ${isSelected ? 'border-[#5B2D8E] scale-110' : 'border-transparent'}`}
        />
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
            rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg
            transition-opacity duration-150 group-hover:opacity-100 z-10"
        >
          {c.name}
        </span>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 items-start">

      {/* Sidebar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:sticky md:top-20 space-y-4">

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full text-sm py-2 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Cambiar producto
        </button>

        {/* Tool buttons */}
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Herramienta</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              {
                id: 'pencil', label: 'Lápiz',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
              },
              {
                id: 'fill', label: 'Relleno',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10l-1.5 10A1.5 1.5 0 0114 18.5H10A1.5 1.5 0 018.5 17L7 7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M10 4h4" />
                    <path d="M20 17c0 1.1-.85 2.5-1.75 2.5S16.5 18.1 16.5 17c0-1.4 1.75-3.5 1.75-3.5S20 15.6 20 17z" fill="currentColor" stroke="none" />
                  </svg>
                ),
              },
              {
                id: 'eraser', label: 'Borrador',
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 20H9L4.5 15.5a2 2 0 010-2.83l8.17-8.17a2 2 0 012.83 0l5 5a2 2 0 010 2.83L13.5 20" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l3.5-3.5" />
                  </svg>
                ),
              },
            ] as { id: Tool; label: string; icon: React.ReactNode }[]).map(t => (
              <button
                key={t.id}
                onClick={() => selectTool(t.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all
                  ${tool === t.id
                    ? 'border-[#5B2D8E] bg-[#5B2D8E] text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#5B2D8E]'}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brush size */}
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
            Tamaño: <span className="text-gray-700">{brushSize}px</span>
          </p>
          <input
            type="range" min={2} max={40} value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-full accent-[#5B2D8E]"
          />
        </div>

        {/* Palette */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Colores</p>
            <div className="grid grid-cols-4 gap-2">
              {SOLID_COLORS.map(c => renderSwatch(c))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Telas</p>
            <div className="grid grid-cols-4 gap-2">
              {TELA_COLORS.map(c => renderSwatch(c))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button onClick={undoLast}
            className="w-full text-sm py-2 rounded-xl border border-gray-200 hover:border-[#5B2D8E] hover:text-[#5B2D8E] transition-colors">
            ↩ Deshacer
          </button>
          <button onClick={clearCanvas}
            className="w-full text-sm py-2 rounded-xl border border-gray-200 hover:border-red-400 hover:text-red-500 transition-colors">
            🗑 Limpiar todo
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-lg text-gray-800">Diseñando: {productName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              <strong>Relleno</strong> colorea áreas grandes · <strong>Lápiz</strong> para detalles
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownload}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#5B2D8E] hover:text-[#5B2D8E] transition-colors">
              ⬇ Descargar
            </button>
            <button onClick={handleContinue}
              className="text-sm px-4 py-1.5 rounded-lg bg-[#5B2D8E] hover:bg-[#4a2275] text-white font-medium transition-colors">
              Continuar →
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-white">
          <canvas
            ref={mainCanvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'none', cursor: 'crosshair' }}
          />
        </div>
      </div>

      {/* Bottom nav mobile */}
      <div className="md:hidden flex justify-between items-center bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 px-4 py-3 z-10 shadow-lg">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800">← Volver</button>
        <span className="text-xs text-gray-400">Usa el lápiz o relleno</span>
        <button onClick={handleContinue}
          className="text-sm px-4 py-2 bg-[#5B2D8E] text-white rounded-xl font-medium">
          Siguiente →
        </button>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
