"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ColorProducto = {
  id: number;
  nombre: string;
  hex: string | null;
  activo: boolean;
};

export async function getColoresProductos(): Promise<ColorProducto[]> {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("colores")
    .select("id,nombre,hex,activo")
    .order("nombre");
  if (error) throw new Error(`Error cargando colores: ${error.message}`);
  return (data ?? []).map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    hex: c.hex,
    activo: c.activo ?? true,
  }));
}

export async function toggleColorProductoActivo(id: number, activo: boolean): Promise<void> {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase.from("colores").update({ activo }).eq("id", id);
  if (error) throw new Error(`Error actualizando color: ${error.message}`);
  revalidatePath("/admin/colores");
  revalidatePath("/mochilas");
}
