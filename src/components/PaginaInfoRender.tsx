import Link from "next/link";
import type { ReactNode } from "react";

export type SeccionInfo = { titulo: string; cuerpo: string };

// Negrita inline con **texto**, sin dangerouslySetInnerHTML (el texto viene
// de un admin, pero esta página la ve cualquier visitante).
function renderInline(texto: string): ReactNode {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, j) =>
    trozo.startsWith("**") && trozo.endsWith("**")
      ? <strong key={j}>{trozo.slice(2, -2)}</strong>
      : trozo
  );
}

// Cada línea del cuerpo se interpreta según cómo empieza:
//   "1. texto"    -> paso numerado (círculo morado con el número adentro)
//   "• texto" / "- texto" -> ítem de lista con punto morado
//   "* texto"     -> nota en caja gris
//   "> texto"     -> bloque destacado (caja con fondo del color de marca)
//   cualquier otra cosa -> párrafo normal
// Esto reproduce los mismos elementos visuales que antes estaban
// hardcodeados en las páginas, pero ahora el admin los controla escribiendo.
//
// Las notas y los destacados originalmente podían tener más de una línea
// dentro de UNA sola caja (ej. dos notas "*" compartiendo el mismo fondo
// gris) — por eso acá se agrupan las líneas consecutivas del mismo tipo
// antes de renderizar, en vez de crear una caja nueva por cada línea.
type Bloque =
  | { tipo: "paso"; numero: string; texto: string }
  | { tipo: "bullet"; texto: string }
  | { tipo: "nota"; textos: string[] }
  | { tipo: "destacado"; textos: string[] }
  | { tipo: "parrafo"; texto: string };

function clasificarLinea(linea: string) {
  const paso = linea.match(/^(\d+)\.\s+(.*)$/);
  if (paso) return { tipo: "paso" as const, numero: paso[1], texto: paso[2] };
  const bullet = linea.match(/^[•\-]\s+(.*)$/);
  if (bullet) return { tipo: "bullet" as const, texto: bullet[1] };
  const nota = linea.match(/^\*\s+(.*)$/);
  if (nota) return { tipo: "nota" as const, texto: nota[1] };
  const destacado = linea.match(/^>\s+(.*)$/);
  if (destacado) return { tipo: "destacado" as const, texto: destacado[1] };
  return { tipo: "parrafo" as const, texto: linea };
}

function agruparBloques(lineas: string[]): Bloque[] {
  const bloques: Bloque[] = [];
  for (const linea of lineas) {
    const c = clasificarLinea(linea);
    const ultimo = bloques[bloques.length - 1];
    if ((c.tipo === "nota" || c.tipo === "destacado") && ultimo?.tipo === c.tipo) {
      ultimo.textos.push(c.texto);
    } else if (c.tipo === "nota" || c.tipo === "destacado") {
      bloques.push({ tipo: c.tipo, textos: [c.texto] });
    } else {
      bloques.push(c);
    }
  }
  return bloques;
}

function renderCuerpo(cuerpo: string): ReactNode {
  // \r?\n: los textarea en Windows guardan \r\n, y un \r colgante al final
  // de cada línea rompía silenciosamente el match de los patrones de abajo
  // en todas las líneas salvo la última.
  const lineas = cuerpo.split(/\r?\n+/).map((l) => l.trim()).filter((l) => l.length > 0);
  const bloques = agruparBloques(lineas);

  return bloques.map((b, i) => {
    if (b.tipo === "paso") {
      return (
        <div key={i} className="flex gap-4 mb-3 last:mb-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-colonta-primary text-white flex items-center justify-center font-bold">
            {b.numero}
          </div>
          <p className="text-slate-700 pt-1">{renderInline(b.texto)}</p>
        </div>
      );
    }

    if (b.tipo === "bullet") {
      return (
        <div key={i} className="flex gap-3 mb-2 last:mb-0">
          <span className="text-colonta-primary">•</span>
          <p className="text-slate-700 flex-1">{renderInline(b.texto)}</p>
        </div>
      );
    }

    if (b.tipo === "nota") {
      return (
        <div key={i} className="mb-3 last:mb-0 p-4 bg-slate-50 rounded-xl space-y-2">
          {b.textos.map((t, j) => (
            <p key={j} className="text-sm text-slate-600"><strong>*</strong> {renderInline(t)}</p>
          ))}
        </div>
      );
    }

    if (b.tipo === "destacado") {
      return (
        <div key={i} className="mb-3 last:mb-0 p-4 bg-colonta-primary/10 rounded-xl border border-colonta-primary/20 space-y-2">
          {b.textos.map((t, j) => (
            <p key={j} className="text-slate-700">{renderInline(t)}</p>
          ))}
        </div>
      );
    }

    return (
      <p key={i} className="text-slate-700 mb-3 last:mb-0">
        {renderInline(b.texto)}
      </p>
    );
  });
}

export default function PaginaInfoRender({
  titulo,
  subtitulo,
  secciones,
}: {
  titulo: string;
  subtitulo: string | null;
  secciones: SeccionInfo[];
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">{titulo}</h1>
          {subtitulo && <p className="text-white/85 mt-2">{subtitulo}</p>}
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {secciones.map((s, i) => (
            <div key={i} className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white">
              {s.titulo && <h2 className="text-2xl font-extrabold mb-4 text-slate-900">{s.titulo}</h2>}
              {renderCuerpo(s.cuerpo)}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
