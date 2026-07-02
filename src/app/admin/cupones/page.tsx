"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api, type DiscountCode } from "@/lib/api";
import Link from "next/link";

export default function CuponesAdminPage() {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cupones, setCupones] = useState<DiscountCode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCupon, setEditingCupon] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState<Partial<DiscountCode>>({
    code: "",
    type: "percent",
    value: 0,
    expirationDate: null,
    usageType: "public",
    reservedEmail: null,
    active: true,
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
        loadCupones();
      }
    }
  }, [user, hydrated, router]);

  async function loadCupones() {
    try {
      setLoading(true);
      const cups = await api.getDiscountCodes();
      setCupones(cups);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar cupones");
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingCupon(null);
    setFormData({
      code: "",
      type: "percent",
      value: 0,
      expirationDate: null,
      usageType: "public",
      reservedEmail: null,
      active: true,
    });
    setShowForm(true);
  }

  function handleEdit(cupon: DiscountCode) {
    setEditingCupon(cupon);
    setFormData({
      code: cupon.code,
      type: cupon.type,
      value: cupon.value,
      expirationDate: cupon.expirationDate,
      usageType: cupon.usageType,
      reservedEmail: cupon.reservedEmail,
      active: cupon.active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      // Asegurar que el valor sea un entero según la API
      const dataToSend: Partial<DiscountCode> = {
        code: formData.code,
        type: formData.type,
        value: Math.round(Number(formData.value) || 0), // Convertir a entero
        expirationDate: formData.expirationDate,
        usageType: formData.usageType,
        reservedEmail: formData.reservedEmail,
        active: formData.active,
      };
      
      if (editingCupon) {
        await api.updateDiscountCode(editingCupon.id, dataToSend);
      } else {
        await api.createDiscountCode(dataToSend);
      }
      setShowForm(false);
      await loadCupones();
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar cupón");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return;
    try {
      setError(null);
      await api.deleteDiscountCode(id);
      await loadCupones();
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar cupón");
    }
  }

  if (loading || !user || user.rol !== "admin") {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Cupones</h1>
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
              <h1 className="text-3xl md:text-4xl font-extrabold">Mantenedor de Cupones</h1>
              <p className="text-white/85 mt-2">Gestiona los códigos de descuento</p>
            </div>
            <button
              onClick={handleNew}
              className="px-5 py-3 rounded-xl bg-white text-colonta-primary font-semibold hover:opacity-90"
            >
              + Nuevo Cupón
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
                {editingCupon ? "Editar Cupón" : "Nuevo Cupón"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Código *</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.code || ""}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="BIENVENIDO10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Tipo *</label>
                    <select
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.type || "percent"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "percent" | "fixed" })}
                    >
                      <option value="percent">Porcentaje</option>
                      <option value="fixed">Fijo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Valor *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.value || 0}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      placeholder={formData.type === "percent" ? "10 (para 10%)" : "5000 (para $5000)"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Tipo de Uso *</label>
                    <select
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.usageType || "public"}
                      onChange={(e) => setFormData({ ...formData, usageType: e.target.value as any })}
                    >
                      <option value="public">Público</option>
                      <option value="user-only">Solo usuarios</option>
                      <option value="reserved-email">Email reservado</option>
                    </select>
                  </div>
                  {formData.usageType === "reserved-email" && (
                    <div>
                      <label className="text-sm font-semibold block mb-1">Email Reservado *</label>
                      <input
                        type="email"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={formData.reservedEmail || ""}
                        onChange={(e) => setFormData({ ...formData, reservedEmail: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold block mb-1">Fecha de Expiración</label>
                    <input
                      type="date"
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.expirationDate ? new Date(formData.expirationDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={formData.active !== false}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <span className="text-sm font-semibold">Activo</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90"
                  >
                    {editingCupon ? "Actualizar" : "Crear"}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Uso</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cupones.map((cupon) => (
                    <tr key={cupon.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium">{cupon.code}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{cupon.type === "percent" ? "Porcentaje" : "Fijo"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {cupon.type === "percent" ? `${cupon.value}%` : `$${new Intl.NumberFormat("es-CL").format(cupon.value)}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {cupon.usageType === "public" ? "Público" : cupon.usageType === "user-only" ? "Solo usuarios" : "Email reservado"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cupon.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {cupon.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(cupon)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(cupon.id)}
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
