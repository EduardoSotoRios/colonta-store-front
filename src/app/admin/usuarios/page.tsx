"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api, type Address } from "@/lib/api";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  rut: string;
  telefono: string;
  direccion: Address;
};

export default function UsuariosAdminPage() {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    nombre: string;
    email: string;
    password: string;
    rut: string;
    telefono: string;
    direccion: Address;
    rol: string;
  }>({
    nombre: "",
    email: "",
    password: "",
    rut: "",
    telefono: "",
    direccion: {
      street: "",
      number: "",
      comuna: "",
      region: "",
      postalCode: "",
    },
    rol: "cliente",
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
        loadUsers();
      }
    }
  }, [user, hydrated, router]);

  async function loadUsers() {
    try {
      setLoading(true);
      const usrs = await api.getUsers();
      setUsers(usrs);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingUser(null);
    setFormData({
      nombre: "",
      email: "",
      password: "",
      rut: "",
      telefono: "",
      direccion: {
        street: "",
        number: "",
        comuna: "",
        region: "",
        postalCode: "",
      },
      rol: "user",
    });
    setShowForm(true);
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: "", // No prellenar contraseña
      rut: user.rut,
      telefono: user.telefono,
      direccion: { ...user.direccion },
      rol: user.rol,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      const data: any = {
        nombre: formData.nombre,
        email: formData.email,
        rut: formData.rut,
        telefono: formData.telefono,
        direccion: formData.direccion,
        rol: formData.rol,
      };
      
      // Solo incluir password si se está creando un nuevo usuario o si se proporcionó uno
      if (!editingUser || formData.password) {
        if (!formData.password) {
          setError("La contraseña es requerida");
          return;
        }
        data.password = formData.password;
      }

      if (editingUser) {
        await api.updateUser(editingUser.id, data);
      } else {
        await api.createUser(data);
      }
      setShowForm(false);
      await loadUsers();
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar usuario");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      setError(null);
      await api.deleteUser(id);
      await loadUsers();
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar usuario");
    }
  }

  if (loading || !user || user.rol !== "admin") {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Usuarios</h1>
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
              <h1 className="text-3xl md:text-4xl font-extrabold">Mantenedor de Usuarios</h1>
              <p className="text-white/85 mt-2">Gestiona los usuarios del sistema</p>
            </div>
            <button
              onClick={handleNew}
              className="px-5 py-3 rounded-xl bg-white text-colonta-primary font-semibold hover:opacity-90"
            >
              + Nuevo Usuario
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
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">
                      Contraseña {editingUser ? "(dejar vacío para no cambiar)" : "*"}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Dejar vacío para mantener la actual" : ""}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">RUT *</label>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.rut}
                      onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                      placeholder="12.345.678-9"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+56 9 12345678"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Rol *</label>
                    <select
                      required
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    >
                      <option value="user">Cliente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* Dirección */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Dirección</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold block mb-1">Calle *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={formData.direccion.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          direccion: { ...formData.direccion, street: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Número *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={formData.direccion.number}
                        onChange={(e) => setFormData({
                          ...formData,
                          direccion: { ...formData.direccion, number: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Comuna *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={formData.direccion.comuna}
                        onChange={(e) => setFormData({
                          ...formData,
                          direccion: { ...formData.direccion, comuna: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Región *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={formData.direccion.region}
                        onChange={(e) => setFormData({
                          ...formData,
                          direccion: { ...formData.direccion, region: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1">Código Postal *</label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                        value={formData.direccion.postalCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          direccion: { ...formData.direccion, postalCode: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90"
                  >
                    {editingUser ? "Actualizar" : "Crear"}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium">{usr.nombre}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{usr.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{usr.telefono}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usr.rol === "admin" 
                            ? "bg-colonta-primary/10 text-colonta-primary" 
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {usr.rol === "admin" ? "Administrador" : "Cliente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(usr)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(usr.id)}
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
