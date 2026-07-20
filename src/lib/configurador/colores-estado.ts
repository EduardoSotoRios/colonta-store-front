"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Capa liviana de disponibilidad sobre el array COLORS de products.ts (13
// colores lisos + 6 telas con imagen). No guarda la definicion del color,
// solo si esta agotado o no — products.ts sigue siendo la fuente de verdad
// de nombres/hex/imagenes.
//
// Usa el cliente admin (service role) a proposito: esta tabla puede vivir
// con RLS activado y sin policies (bloqueando la anon key del navegador),
// ya que tanto la lectura (configurador publico) como la escritura (toggle
// del admin) pasan siempre por estas Server Actions, nunca directo del cliente.
export async function getConfiguradorColoresEstado(): Promise<Record<string, boolean>> {
  const supabase = await createSupabaseAdminClient();
  const { data } = await supabase.from("configurador_colores_estado").select("nombre,activo");
  const mapa: Record<string, boolean> = {};
  for (const row of data ?? []) {
    mapa[row.nombre as string] = row.activo as boolean;
  }
  return mapa;
}

export async function setConfiguradorColorActivo(nombre: string, activo: boolean): Promise<void> {
  const supabase = await createSupabaseAdminClient();
  const { error } = await supabase
    .from("configurador_colores_estado")
    .upsert({ nombre, activo }, { onConflict: "nombre" });
  if (error) throw new Error(`Error actualizando estado del color: ${error.message}`);
  revalidatePath("/admin/colores");
  revalidatePath("/personalizar");
}
