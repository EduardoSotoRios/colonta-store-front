"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { getColoresProductos, toggleColorProductoActivo, type ColorProducto } from "./actions";
import { getConfiguradorColoresEstado, setConfiguradorColorActivo } from "@/lib/configurador/colores-estado";
import { COLORS as CONFIGURADOR_COLORS } from "@/lib/configurador/products";
import { getColorEmoji } from "@/lib/colores-map";

function textureSrc(value: string): string {
  return `/configurador/patterns/${value.replace("pattern-", "")}.png`;
}

// ── Tarjeta de swatch reutilizable para ambas secciones ─────────────────────
function SwatchCard({
  nombre, activo, busy, onToggle, preview,
}: {
  nombre: string;
  activo: boolean;
  busy: boolean;
  onToggle: () => void;
  preview: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col items-center gap-2 text-center ${activo ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50"}`}>
      <div className={`relative w-14 h-14 rounded-lg overflow-hidden ring-1 ring-black/10 ${activo ? "" : "opacity-40 grayscale"}`}>
        {preview}
      </div>
      <p className="text-xs font-medium text-slate-700">{nombre}</p>
      {!activo && (
        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
          Agotado
        </span>
      )}
      <button
        onClick={onToggle}
        disabled={busy}
        className={`text-xs font-semibold px-2 py-1 rounded-lg w-full disabled:opacity-50 ${
          activo
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {busy ? "..." : activo ? "Marcar agotado" : "Marcar disponible"}
      </button>
    </div>
  );
}

export default function ColoresAdminPage() {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [coloresProductos, setColoresProductos] = useState<ColorProducto[]>([]);
  const [estadoConfigurador, setEstadoConfigurador] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated) {
      if (!user) {
        router.push("/login");
      } else if (user.rol !== "admin") {
        router.push("/");
      } else {
        cargarTodo();
      }
    }
  }, [user, hydrated, router]);

  async function cargarTodo() {
    try {
      setLoading(true);
      setError(null);
      const [colores, estado] = await Promise.all([
        getColoresProductos(),
        getConfiguradorColoresEstado(),
      ]);
      setColoresProductos(colores);
      setEstadoConfigurador(estado);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar los colores");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleProducto(color: ColorProducto) {
    setBusyId(`producto-${color.id}`);
    try {
      await toggleColorProductoActivo(color.id, !color.activo);
      setColoresProductos((prev) =>
        prev.map((c) => (c.id === color.id ? { ...c, activo: !c.activo } : c))
      );
    } catch (e: any) {
      setError(e?.message ?? "Error al actualizar el color");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleConfigurador(nombre: string, activoActual: boolean) {
    setBusyId(`config-${nombre}`);
    try {
      await setConfiguradorColorActivo(nombre, !activoActual);
      setEstadoConfigurador((prev) => ({ ...prev, [nombre]: !activoActual }));
    } catch (e: any) {
      setError(e?.message ?? "Error al actualizar la tela");
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !user || user.rol !== "admin") {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Colores</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border p-6 bg-white">
              <p>Cargando...</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al panel
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Mantenedor de Colores</h1>
          <p className="text-white/85 mt-2">
            Marca como "Agotado" cualquier color o tela que ya no tenga material disponible —
            deja de poder elegirse tanto en los productos como en el diseñador, sin borrar
            fotos ni diseños ya existentes.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Colores de productos reales */}
          <div>
            <h2 className="font-extrabold text-lg mb-1">Colores de productos</h2>
            <p className="text-sm text-slate-500 mb-4">
              Usados en las fotos/variantes de los productos de la tienda. Si marcas uno como
              agotado, sus fotos siguen apareciendo en la ficha del producto pero ya no se
              pueden elegir para comprar.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {coloresProductos.map((c) => (
                <SwatchCard
                  key={c.id}
                  nombre={c.nombre}
                  activo={c.activo}
                  busy={busyId === `producto-${c.id}`}
                  onToggle={() => handleToggleProducto(c)}
                  preview={
                    c.hex ? (
                      <div className="w-full h-full" style={{ backgroundColor: c.hex }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-2xl">
                        {getColorEmoji(c.nombre) ?? "🎨"}
                      </div>
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Colores y telas del configurador */}
          <div>
            <h2 className="font-extrabold text-lg mb-1">Colores y telas del diseñador ("Dale tu Sello")</h2>
            <p className="text-sm text-slate-500 mb-4">
              Los colores lisos y las telas con imagen (Manchas, Leopardo, etc.) que un cliente
              puede elegir al diseñar su propio producto. Agotar uno lo deja atenuado y no
              seleccionable en el lienzo de diseño.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {CONFIGURADOR_COLORS.map((c) => {
                const activo = estadoConfigurador[c.name] !== false;
                const esTela = c.value.startsWith("pattern-");
                return (
                  <SwatchCard
                    key={c.name}
                    nombre={c.name}
                    activo={activo}
                    busy={busyId === `config-${c.name}`}
                    onToggle={() => handleToggleConfigurador(c.name, activo)}
                    preview={
                      esTela ? (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage: `url('${textureSrc(c.value)}')`,
                            backgroundSize: "200%",
                            backgroundPosition: "center",
                          }}
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: c.value }} />
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
