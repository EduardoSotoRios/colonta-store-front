import { createSupabaseAdminClient } from "@/lib/supabase/server";
import AdminBannersClient from "./AdminBannersClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  let banners: any[] = [];
  let configError: string | null = null;

  try {
    const supabase = await createSupabaseAdminClient();
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("orden", { ascending: true });
    banners = data ?? [];
  } catch (e: any) {
    configError = e?.message ?? "Error de configuración del servidor.";
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Banners</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Gestiona las imágenes del carrusel en la página principal.
        </p>
      </div>
      {configError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">
          Error de configuración: {configError}
        </div>
      )}
      <AdminBannersClient banners={banners} />
    </div>
  );
}
