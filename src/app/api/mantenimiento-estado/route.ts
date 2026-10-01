import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Endpoint publico y liviano (sin datos sensibles) para que el Header del
// cliente sepa si mostrar el indicador rojo al admin. /api/ ya esta
// excluido del bloqueo de mantencion en middleware.ts, asi que siempre
// responde, incluso con el sitio bloqueado.
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("mantenimiento")
      .eq("id", 1)
      .maybeSingle();
    return NextResponse.json({ activo: data?.mantenimiento === true });
  } catch {
    return NextResponse.json({ activo: false });
  }
}
