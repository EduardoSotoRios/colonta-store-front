// Páginas de información/legales editables desde Admin > Mantenimiento.
// Agregar una nueva página acá + usar <PaginaInfoRender> en su page.tsx
// es todo lo que se necesita para que quede editable.
export const PAGINAS_INFO = [
  { slug: "garantia",             nombre: "Garantía",              ruta: "/garantia" },
  { slug: "politica-compra",      nombre: "Términos y Condiciones", ruta: "/politica-compra" },
  { slug: "preguntas-frecuentes", nombre: "Preguntas Frecuentes",   ruta: "/preguntas-frecuentes" },
] as const;

export type PaginaInfoSlug = typeof PAGINAS_INFO[number]["slug"];
