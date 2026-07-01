import { createSupabaseServerClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/HeroCarousel";

export default async function Hero() {
  const supabase = await createSupabaseServerClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("id,url,titulo,subtitulo,cta_texto,cta_href,cta2_texto,cta2_href")
    .eq("activo", true)
    .order("orden", { ascending: true });

  // Fallback al banner estático si no hay banners en BD
  const slides = banners && banners.length > 0
    ? banners
    : [{
        id: 0,
        url: "/hero.png",
        titulo: "¡Cree en ti y cambia todo!",
        subtitulo: "Mochilas y accesorios hechos para acompañarte en tus viajes, tu día a día y tus aventuras. Personaliza la tuya y llévala a todas partes.",
        cta_texto: "Ver colección completa",
        cta_href: "/mochilas",
        cta2_texto: "Dale tu sello",
        cta2_href: "/personalizar",
      }];

  return <HeroCarousel banners={slides} />;
}
