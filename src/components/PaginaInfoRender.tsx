import Link from "next/link";
import type { ReactNode } from "react";

export type SeccionInfo = { titulo: string; cuerpo: string };

// Soporta **negrita** y respeta los saltos de línea como párrafos separados,
// sin usar dangerouslySetInnerHTML (el texto viene de un admin, pero esta
// página la ve cualquier visitante, así que evitamos insertar HTML crudo).
function renderCuerpo(cuerpo: string): ReactNode {
  const parrafos = cuerpo.split(/\n+/).filter((p) => p.trim().length > 0);
  return parrafos.map((parrafo, i) => (
    <p key={i} className="text-slate-700 mb-3 last:mb-0">
      {parrafo.split(/(\*\*[^*]+\*\*)/g).map((trozo, j) =>
        trozo.startsWith("**") && trozo.endsWith("**")
          ? <strong key={j}>{trozo.slice(2, -2)}</strong>
          : trozo
      )}
    </p>
  ));
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
