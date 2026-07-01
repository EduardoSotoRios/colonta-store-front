export default function ValueActions() {
  return (
    <section id="personaliza" className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-4">
          <a className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 p-6 hover:shadow transition" href="#catalogo">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[var(--colonta-primary)]/10 text-[var(--colonta-primary)] flex items-center justify-center font-bold">C</div>
              <div><h3 className="font-semibold">Catálogo completo</h3><p className="text-sm text-slate-600">Todos los modelos, colores y tallas.</p></div>
            </div>
          </a>
          <a className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 p-6 hover:shadow transition" href="#descuentos">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center font-bold">%</div>
              <div><h3 className="font-semibold">Descuentos</h3><p className="text-sm text-slate-600">Packs y ofertas por tiempo limitado.</p></div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}