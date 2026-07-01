// src/app/admin/productos/nuevo/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminProductoForm from "@/components/admin/AdminProductoForm";

export const dynamic = "force-dynamic";

const CATEGORIAS = [
  { slug: "mochilas",   nombre: "Mochilas" },
  { slug: "bananos",    nombre: "Bananos" },
  { slug: "bolsos",     nombre: "Bolsos" },
  { slug: "notebook",   nombre: "Porta Notebook" },
  { slug: "accesorios", nombre: "Accesorios" },
];

export default async function NuevoProductoPage() {
  const supabase = await createSupabaseServerClient();
  const { data: colores } = await supabase.from("colores").select("id,nombre,hex").order("nombre");

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <a href="/admin/productos" className="text-sm text-slate-500 hover:text-slate-700">
          ← Volver a productos
        </a>
        <h1 className="text-2xl font-extrabold mt-2">Nuevo producto</h1>
      </div>
      <AdminProductoForm
        producto={null}
        categorias={CATEGORIAS}
        esNuevo={true}
        colores={colores ?? []}
      />
    </div>
  );
}
