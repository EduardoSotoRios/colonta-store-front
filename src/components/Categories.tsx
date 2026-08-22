const categories = [
  { slug: "mochilas",  name: "Mochilas",        imageUrl: "/viaje-menu.jpg" },
  { slug: "bananos",   name: "Bananos",          imageUrl: "/urbano-menu.jpg" },
  { slug: "bolsos",    name: "Bolsos",           imageUrl: "/dbdmenu.jpg" },
  { slug: "notebook",  name: "Porta Notebook",   imageUrl: "/peque-menu.jpg" },
  { slug: "accesorios",name: "Accesorios",       imageUrl: "/accesorios-menu.png" },
];

export default function Categories() {
  return (
    <section id="categorias" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold">Explora por categoría</h2>
          <a href="/mochilas" className="text-sm font-semibold text-[var(--colonta-primary)] hover:opacity-80">
            Ver todo →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <a key={c.slug} href={`/mochilas?category=${c.slug}`} className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 overflow-hidden group h-80 relative">
              <img src={c.imageUrl} alt={c.name} className="h-70 w-full object-cover group-hover:scale-105 transition" />
              <div className="p-3 absolute w-full bg-[var(--colonta-primary)]"><p className="text-sm text-center font-semibold text-white">{c.name}</p></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}