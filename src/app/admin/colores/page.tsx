"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api, type ColorSchemeType } from "@/lib/api";
import Link from "next/link";

type ColorScheme = {
  id: string;
  type: ColorSchemeType;
  name: string | null;
  colors: string[];
};

export default function ColoresAdminPage() {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState<ColorScheme | null>(null);
  const [formData, setFormData] = useState<{ type: ColorSchemeType; name: string; colors: string[] }>({
    type: "preset",
    name: "",
    colors: [],
  });

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated) {
      if (!user) {
        router.push("/login");
      } else if (user.rol !== "admin") {
        router.push("/");
      } else {
        loadColorSchemes();
      }
    }
  }, [user, hydrated, router]);

  async function loadColorSchemes() {
    try {
      setLoading(true);
      const schemes = await api.getColorSchemes();
      setColorSchemes(schemes);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar esquemas de color");
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingScheme(null);
    setFormData({ type: "preset", name: "", colors: [] });
    setShowForm(true);
  }

  function handleEdit(scheme: ColorScheme) {
    setEditingScheme(scheme);
    setFormData({
      type: scheme.type,
      name: scheme.name || "",
      colors: [...scheme.colors],
    });
    setShowForm(true);
  }

  function addColor() {
    setFormData({
      ...formData,
      colors: [...formData.colors, "#000000"],
    });
  }

  function removeColor(index: number) {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  }

  function updateColor(index: number, color: string) {
    const newColors = [...formData.colors];
    newColors[index] = color;
    setFormData({
      ...formData,
      colors: newColors,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.colors.length === 0) {
      setError("Debes agregar al menos un color");
      return;
    }
    try {
      setError(null);
      const data = {
        type: formData.type,
        name: formData.name || undefined,
        colors: formData.colors.filter((c) => c.trim() !== ""),
      };
      if (editingScheme) {
        await api.updateColorScheme(editingScheme.id, data);
      } else {
        await api.createColorScheme(data);
      }
      setShowForm(false);
      await loadColorSchemes();
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar esquema de color");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este esquema de color?")) return;
    try {
      setError(null);
      await api.deleteColorScheme(id);
      await loadColorSchemes();
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar esquema de color");
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
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
                ← Volver al panel
              </Link>
              <h1 className="text-3xl md:text-4xl font-extrabold">Mantenedor de Colores</h1>
              <p className="text-white/85 mt-2">Gestiona los esquemas de colores disponibles</p>
            </div>
            <button
              onClick={handleNew}
              className="px-5 py-3 rounded-xl bg-white text-colonta-primary font-semibold hover:opacity-90"
            >
              + Nuevo Esquema
            </button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {showForm && (
            <div className="mb-6 rounded-2xl ring-1 ring-black/5 p-6 bg-white">
              <h2 className="font-extrabold text-lg mb-4">
                {editingScheme ? "Editar Esquema de Color" : "Nuevo Esquema de Color"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Tipo *</label>
                    <select
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ColorSchemeType })}
                    >
                      <option value="preset">Preset</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Azul Marino"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold block mb-2">Colores *</label>
                    
                    {/* Tags de colores */}
                    {formData.colors.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {formData.colors.map((color, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 bg-white"
                            style={{ borderColor: color }}
                          >
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => updateColor(index, e.target.value)}
                              className="w-8 h-8 rounded border cursor-pointer"
                              title="Seleccionar color"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => updateColor(index, e.target.value)}
                              className="w-24 border rounded px-2 py-1 text-xs font-mono"
                              placeholder="#000000"
                              pattern="^#[0-9A-Fa-f]{6}$"
                            />
                            <button
                              type="button"
                              onClick={() => removeColor(index)}
                              className="text-red-600 hover:text-red-700 text-sm font-bold"
                              title="Eliminar color"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón para agregar color */}
                    <button
                      type="button"
                      onClick={addColor}
                      className="px-4 py-2 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm font-medium"
                    >
                      + Agregar Color
                    </button>
                    {formData.colors.length === 0 && (
                      <p className="text-xs text-slate-500 mt-2">Haz clic en "Agregar Color" para comenzar</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90"
                  >
                    {editingScheme ? "Actualizar" : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 rounded-xl border font-semibold hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Colores</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {colorSchemes.map((scheme) => (
                    <tr key={scheme.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium">{scheme.name || "Sin nombre"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{scheme.type}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex gap-2 flex-wrap">
                          {scheme.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 bg-white"
                              style={{ borderColor: color }}
                            >
                              <span
                                className="inline-block w-5 h-5 rounded border border-slate-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                              <span className="text-xs font-mono text-slate-700">{color}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(scheme)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(scheme.id)}
                            className="px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
