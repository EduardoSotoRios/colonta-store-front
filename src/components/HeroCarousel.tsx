"use client";

import { useEffect, useState, useCallback } from "react";

type Banner = {
  id: number;
  url: string;
  titulo: string | null;
  subtitulo: string | null;
  cta_texto: string | null;
  cta_href: string | null;
  cta2_texto: string | null;
  cta2_href: string | null;
};

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = banners.length;

  const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, total, paused]);

  const banner = banners[current];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Imágenes */}
      <div className="absolute inset-0 -z-10">
        {banners.map((b, i) => (
          <img
            key={b.id}
            src={b.url}
            alt={b.titulo ?? "Banner"}
            className={`absolute inset-0 w-full h-full object-cover object-center opacity-80 transition-opacity duration-700 ${
              i === current ? "opacity-80" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl transition-all duration-500">
          {banner.titulo && (
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
              {banner.titulo}
            </h1>
          )}
          {banner.subtitulo && (
            <p className="mt-5 text-white max-w-xl">{banner.subtitulo}</p>
          )}
          {(banner.cta_texto || banner.cta2_texto) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {banner.cta_texto && banner.cta_href && (
                <a
                  href={banner.cta_href}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: "var(--colonta-primary)" }}
                >
                  {banner.cta_texto}
                </a>
              )}
              {banner.cta2_texto && banner.cta2_href && (
                <a
                  href={banner.cta2_href}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-[var(--colonta-primary)] border bg-white/80"
                  style={{ borderColor: "var(--colonta-primary)" }}
                >
                  {banner.cta2_texto}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Flechas de navegación */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white shadow flex items-center justify-center text-slate-700 transition-colors"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white shadow flex items-center justify-center text-slate-700 transition-colors"
            aria-label="Siguiente"
          >
            ›
          </button>

          {/* Puntos */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-white w-5" : "bg-white/50"
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
