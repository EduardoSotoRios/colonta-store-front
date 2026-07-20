import { createSupabaseAdminClient } from "@/lib/supabase/server";
import AdminBannersClient from "./AdminBannersClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const supabase = await createSupabaseAdminClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("orden", { ascending: true });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Banners</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Gestiona las imágenes del carrusel en la página principal.
        </p>
      </div>
      <AdminBannersClient banners={banners ?? []} />
    </div>
  );
}
