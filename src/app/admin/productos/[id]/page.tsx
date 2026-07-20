// src/app/admin/productos/[id]/page.tsx
// También sirve para crear: src/app/admin/productos/nuevo/page.tsx
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AdminProductoForm from "@/components/admin/AdminProductoForm";

export const dynamic = "force-dynamic";

const CATEGORIAS = [
  { slug: "mochilas",   nombre: "Mochilas" },
  { slug: "bananos",    nombre: "Bananos" },
  { slug: "bolsos",     nombre: "Bolsos" },
  { slug: "notebook",   nombre: "Porta Notebook" },
  { slug: "accesorios", nombre: "Accesorios" },
];

export default async function AdminProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const esNuevo = id === "nuevo";

  const supabase = await createSupabaseAdminClient();

  const [{ data: colores }, productoResult] = await Promise.all([
    supabase.from("colores").select("id,nombre,hex").order("nombre"),
    esNuevo
      ? Promise.resolve({ data: null, error: null })
      : supabase
          .from("productos_completos")
          .select("*, producto_specs(*), producto_caracteristicas(*), producto_imagenes(*)")
          .eq("id", id)
          .single(),
  ]);

  if (!esNuevo && (productoResult.error || !productoResult.data)) return notFound();
  const producto = productoResult.data ?? null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <a href="/admin/productos" className="text-sm text-slate-500 hover:text-slate-700">
          ← Volver a productos
        </a>
        <h1 className="text-2xl font-extrabold mt-2">
          {esNuevo ? "Nuevo producto" : `Editar: ${producto?.nombre}`}
        </h1>
      </div>

      <AdminProductoForm
        producto={producto}
        categorias={CATEGORIAS}
        esNuevo={esNuevo}
        colores={colores ?? []}
      />
    </div>
  );
}