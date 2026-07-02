// Emoji para colores que son patrones visuales sin un solo tono sólido.
// El hex de cada color viene directo desde la tabla colores en Supabase.
export const COLOR_EMOJI: Record<string, string> = {
  "Animal Print": "🐆",
  "Girasol":      "🌻",
  "Corazon":      "❤️",
};

export function getColorEmoji(nombre: string): string | undefined {
  return COLOR_EMOJI[nombre.trim()];
}
