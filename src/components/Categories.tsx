import type { Category } from "@/types";

const categories: Category[] = [
  { id: "acc", name: "Accesorios", imageUrl: "/accesorios-menu.png" },
  { id: "viaje", name: "Viaje", imageUrl: "/viaje-menu.jpg" },
  { id: "urbano", name: "Urbano", imageUrl: "/urbano-menu.jpg" },
  { id: "diario", name: "Día a día", imageUrl: "/dbdmenu.jpg" },
  { id: "peque", name: "Pequeño", imageUrl: "/peque-menu.jpg" },
];

export default function Categories() {
  return (
    <section id="categorias" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold">Explora por categoría</h2>
          <a href="#productos" className="text-sm font-semibold text-[var(--colonta-primary)] hover:opacity-80">
            Ver todo →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <a key={c.id} href="#productos" className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 overflow-hidden group h-80 relative">
              <img src={c.imageUrl} alt={c.name} className="h-70 w-full object-cover group-hover:scale-105 transition" />
              <div className="p-3 absolute w-full bg-[var(--colonta-primary)]"><p className="text-sm text-center font-semibold text-white">{c.name}</p></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}