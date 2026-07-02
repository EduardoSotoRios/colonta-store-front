export default function Inspiration() {
  return (
    <section className="relative">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover"
          alt="Paisaje"
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(74,59,141,.2)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 md:p-10 max-w-2xl shadow">
          <h3 className="text-2xl md:text-3xl font-extrabold">Viaja junto a Colonta</h3>
          <p className="mt-3 text-slate-700">Diseñadas para durar, pensadas para tu comodidad. Materiales resistentes y detalles que marcan la diferencia.</p>
          <a href="#productos" className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white mt-6 hover:opacity-90" style={{ backgroundColor: "var(--colonta-primary)" }}>Descubrir ahora</a>
        </div>
      </div>
    </section>
  );
}