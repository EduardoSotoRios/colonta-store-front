"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { subirImagenExtra, getExtrasMeta, sincronizarExtra, eliminarExtraMeta } from "@/actions/extras-meta";
import Link from "next/link";

type Extra = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type PreviewExtra = Extra & { imageUrl: string };

function ImagePreviewModal({
  extra,
  imageUrl,
  onClose,
  onUploaded,
}: {
  extra: Extra;
  imageUrl: string;
  onClose: () => void;
  onUploaded: (extraId: string, url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const url = await subirImagenExtra(extra.id, fd);
      onUploaded(extra.id, url);
    } catch (err: any) {
      setError(err?.message ?? "Error al subir imagen");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen grande */}
        <div className="bg-slate-100 aspect-square w-full">
          <img
            src={imageUrl}
            alt={extra.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info + acciones */}
        <div className="p-4 space-y-3">
          <p className="font-semibold text-slate-800">{extra.name}</p>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-2">
            <label
              className={`flex-1 text-center px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                subiendo
                  ? "opacity-50 pointer-events-none bg-slate-50"
                  : "hover:bg-slate-50"
              }`}
            >
              {subiendo ? "Subiendo…" : "Cambiar imagen"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={subiendo}
                onChange={handleFile}
              />
            </label>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold hover:bg-slate-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExtrasAdminPage() {
  const { user, hydrate, hydrated } = useAuth();
  const router = useRouter();
  const [loading, setLoading]           = useState(true);
  const [extras, setExtras]             = useState<Extra[]>([]);
  const [imagenesMap, setImagenesMap]   = useState<Record<string, string>>({});
  const [subiendoId, setSubiendoId]     = useState<string | null>(null);
  const [preview, setPreview]           = useState<PreviewExtra | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [formData, setFormData]         = useState({ name: "", description: "", price: 0 });

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated) {
      if (!user) router.push("/login");
      else if (user.rol !== "admin") router.push("/");
      else loadAll();
    }
  }, [user, hydrated, router]);

  async function loadAll() {
    try {
      setLoading(true);
      const [exts, meta] = await Promise.all([api.getExtras(), getExtrasMeta()]);
      setExtras(exts);
      setImagenesMap(meta);
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
    setFormData({ name: extra.name, description: extra.description, price: extra.price });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      const data = { ...formData, price: Math.round(Number(formData.price) || 0) };
      let saved: Extra;
      if (editingExtra) {
        saved = await api.updateExtra(editingExtra.id, data);
      } else {
        saved = await api.createExtra(data);
      }
      // Sincronizar con Supabase para que los productos reflejen el precio actualizado
      await sincronizarExtra(saved);
      setShowForm(false);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar extra");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este extra?")) return;
    try {
      setError(null);
      await api.deleteExtra(id);
      await eliminarExtraMeta(id);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar extra");
    }
  }

  async function handleSubirImagen(extraId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoId(extraId);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const url = await subirImagenExtra(extraId, fd);
      setImagenesMap((prev) => ({ ...prev, [extraId]: url }));
    } catch (err: any) {
      setError(err?.message ?? "Error al subir imagen");
    } finally {
      setSubiendoId(null);
      e.target.value = "";
    }
  }

  if (loading || !user || user.rol !== "admin") {
    return (
      <div className="p-8">
        <p className="text-slate-500 text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Modal de preview */}
      {preview && (
        <ImagePreviewModal
          extra={preview}
          imageUrl={preview.imageUrl}
          onClose={() => setPreview(null)}
          onUploaded={(id, url) => {
            setImagenesMap((prev) => ({ ...prev, [id]: url }));
            setPreview((p) => p ? { ...p, imageUrl: url } : null);
          }}
        />
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700">
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-extrabold mt-2">Extras</h1>
        </div>
        <button
          onClick={handleNew}
          className="px-5 py-2.5 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90"
        >
          + Nuevo Extra
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulario crear/editar */}
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
                <label className="text-sm font-semibold block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="px-5 py-2 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90">
                {editingExtra ? "Actualizar" : "Crear"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-xl border font-semibold hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase w-20">Imagen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase hidden md:table-cell">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {extras.map((extra) => {
              const imgUrl   = imagenesMap[extra.id];
              const subiendo = subiendoId === extra.id;
              return (
                <tr key={extra.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Thumbnail — clic para preview si hay imagen */}
                      <div
                        className={`w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 ${imgUrl ? "cursor-pointer hover:ring-2 hover:ring-colonta-primary" : ""}`}
                        onClick={() => imgUrl && setPreview({ ...extra, imageUrl: imgUrl })}
                        title={imgUrl ? "Ver imagen" : ""}
                      >
                        {imgUrl ? (
                          <img src={imgUrl} alt={extra.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      {/* Botón subir */}
                      <label
                        className={`text-xs px-2 py-1 rounded-lg border border-slate-200 font-medium cursor-pointer hover:bg-slate-50 whitespace-nowrap ${subiendo ? "opacity-50 pointer-events-none" : ""}`}
                        title="Subir imagen"
                      >
                        {subiendo ? "…" : imgUrl ? "↑" : "+ Foto"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={subiendo}
                          onChange={(e) => handleSubirImagen(extra.id, e)}
                        />
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{extra.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{extra.description}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    ${new Intl.NumberFormat("es-CL").format(extra.price)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(extra)}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(extra.id)}
                        className="px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium text-xs">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
