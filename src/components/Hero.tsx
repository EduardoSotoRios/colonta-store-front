import { createSupabaseServerClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/HeroCarousel";

export default async function Hero() {
  let banners: any[] | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const result = await supabase
      .from("banners")
      .select("id,url,titulo,subtitulo,botones")
      .eq("activo", true)
      .order("orden", { ascending: true });
    if (!result.error) banners = result.data;
  } catch {
    banners = null;
  }

  // Fallback al banner estático si no hay banners en BD
  const slides = banners && banners.length > 0
    ? banners
    : [{
        id: 0,
        url: "/hero.png",
        titulo: "¡Cree en ti y cambia todo!",
        subtitulo: "Mochilas y accesorios hechos para acompañarte en tus viajes, tu día a día y tus aventuras. Personaliza la tuya y llévala a todas partes.",
        botones: [
          { texto: "Ver colección completa", href: "/mochilas" },
          { texto: "Dale tu sello", href: "/personalizar" },
        ],
      }];

  return <HeroCarousel banners={slides} />;
}
