"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Link from "next/link";

type Extra = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function ExtrasAdminPage() {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [formData, setFormData] = useState<{ name: string; description: string; price: number }>({
    name: "",
    description: "",
    price: 0,
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
        loadExtras();
      }
    }
  }, [user, hydrated, router]);

  async function loadExtras() {
    try {
      setLoading(true);
      const exts = await api.getExtras();
      setExtras(exts);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar extras");
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingExtra(null);
    setFormData({ name: "", description: "", price: 0 });
    setShowForm(true);
  }

  function handleEdit(extra: Extra) {
    setEditingExtra(extra);
    setFormData({
      name: extra.name,
      description: extra.description,
      price: extra.price,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      // Asegurar que el precio sea un entero según la API
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        price: Math.round(Number(formData.price) || 0), // Convertir a entero
      };
      
      if (editingExtra) {
        await api.updateExtra(editingExtra.id, dataToSend);
      } else {
        await api.createExtra(dataToSend);
      }
      setShowForm(false);
      await loadExtras();
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar extra");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este extra?")) return;
    try {
      setError(null);
      await api.deleteExtra(id);
      await loadExtras();
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar extra");
    }
  }

  if (loading || !user || user.rol !== "admin") {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Extras</h1>
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
              <h1 className="text-3xl md:text-4xl font-extrabold">Mantenedor de Extras</h1>
              <p className="text-white/85 mt-2">Gestiona los extras y accesorios adicionales</p>
            </div>
            <button
              onClick={handleNew}
              className="px-5 py-3 rounded-xl bg-white text-colonta-primary font-semibold hover:opacity-90"
            >
              + Nuevo Extra
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
                {editingExtra ? "Editar Extra" : "Nuevo Extra"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Precio *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold block mb-1">Descripción *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90"
                  >
                    {editingExtra ? "Actualizar" : "Crear"}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {extras.map((extra) => (
                    <tr key={extra.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium">{extra.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{extra.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">${new Intl.NumberFormat("es-CL").format(extra.price)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(extra)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(extra.id)}
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
