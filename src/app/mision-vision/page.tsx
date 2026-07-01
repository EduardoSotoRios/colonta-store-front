import Link from "next/link";

export default function MisionVisionPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Misión y Visión</h1>
          <p className="text-white/85 mt-2">Somos Colonta</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-2xl ring-1 ring-black/5 p-6 md:p-8 bg-white space-y-8">
            {/* Somos Colonta */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Somos Colonta</h2>
              <p className="text-slate-700 mb-4">
                Colonta nace en el año 2013 como compañera de aventuras, de la mano de su creadora Katherine Peña. Su visión fue dar vida a mochilas únicas, impermeables y veganas, que unieran diseño con durabilidad, resistencia y conciencia sustentable, respondiendo a lo que no encontraba en el mercado.
              </p>
              <p className="text-slate-700">
                A lo largo del tiempo, la marca ha crecido en paralelo al propio camino personal de Kathy, evolucionando e integrando nuevos productos, símbolos y runas que reflejan una conexión más profunda con lo espiritual. Hoy, Colonta no solo ofrece accesorios, sino que acompaña con propósito, llevando consigo la energía de la transformación y la búsqueda interior en cada creación.
              </p>
            </div>

            {/* Misión */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Nuestra misión</h2>
              <div className="p-6 bg-colonta-primary/10 rounded-xl border border-colonta-primary/20">
                <p className="text-slate-700 italic text-lg">
                  "Nuestra misión es diseñar y confeccionar mochilas y accesorios veganos, impermeables y resistentes, hechos a mano bajo pedido, que acompañen tanto la vida urbana como las aventuras al aire libre. Creamos productos funcionales y personalizados, con estilo y conciencia, que expresan la autenticidad de cada persona y nuestro compromiso con el planeta."
                </p>
              </div>
            </div>

            {/* Visión */}
            <div>
              <h2 className="text-2xl font-extrabold mb-4 text-slate-900">Nuestra visión</h2>
              <div className="p-6 bg-colonta-primary/10 rounded-xl border border-colonta-primary/20">
                <p className="text-slate-700 italic text-lg">
                  "Ser una marca que trasciende lo material, creando mochilas y accesorios que no solo acompañen, sino que inspiren caminos de libertad, conexión y conciencia. En Colonta soñamos con un mundo en el que cada persona lleve consigo un producto que refleje su autenticidad, proteja la Tierra y resuene con lo espiritual, convirtiéndose en un puente entre lo cotidiano y lo sagrado."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
