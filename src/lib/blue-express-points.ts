// src/lib/blue-express-points.ts
// Lista de puntos de retiro Blue Express en Chile
// Verificar y actualizar con datos oficiales en: https://www.blueexpress.cl

export interface BlueExpressPoint {
  id: string;
  name: string;
  address: string;
  comuna: string;
  city: string;
  region: string;
  hours: string;
}

export const BLUE_EXPRESS_POINTS: BlueExpressPoint[] = [
  // --- Región Metropolitana ---
  {
    id: "RM-001",
    name: "Blue Express Santiago Centro",
    address: "Av. Libertador Bernardo O'Higgins 1234",
    comuna: "Santiago",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-002",
    name: "Blue Express Providencia",
    address: "Av. Providencia 890",
    comuna: "Providencia",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-003",
    name: "Blue Express Las Condes",
    address: "Av. Apoquindo 4500",
    comuna: "Las Condes",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-004",
    name: "Blue Express Maipú",
    address: "Av. Pajaritos 2650",
    comuna: "Maipú",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-005",
    name: "Blue Express La Florida",
    address: "Av. Vicuña Mackenna 7110",
    comuna: "La Florida",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-006",
    name: "Blue Express Puente Alto",
    address: "Av. Concha y Toro 1890",
    comuna: "Puente Alto",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-007",
    name: "Blue Express San Bernardo",
    address: "Av. Colón 456",
    comuna: "San Bernardo",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-008",
    name: "Blue Express Quilicura",
    address: "Av. Américo Vespucio 3900",
    comuna: "Quilicura",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-009",
    name: "Blue Express Ñuñoa",
    address: "Av. Irarrázaval 2450",
    comuna: "Ñuñoa",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  {
    id: "RM-010",
    name: "Blue Express Peñalolén",
    address: "Av. Grecia 8520",
    comuna: "Peñalolén",
    city: "Santiago",
    region: "Región Metropolitana",
    hours: "Lun-Vie 9:00-19:00 / Sáb 9:00-14:00",
  },
  // --- Valparaíso ---
  {
    id: "V-001",
    name: "Blue Express Valparaíso",
    address: "Av. Argentina 850",
    comuna: "Valparaíso",
    city: "Valparaíso",
    region: "Región de Valparaíso",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  {
    id: "V-002",
    name: "Blue Express Viña del Mar",
    address: "Av. Valparaíso 400",
    comuna: "Viña del Mar",
    city: "Viña del Mar",
    region: "Región de Valparaíso",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  {
    id: "V-003",
    name: "Blue Express San Antonio",
    address: "Barros Luco 123",
    comuna: "San Antonio",
    city: "San Antonio",
    region: "Región de Valparaíso",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- O'Higgins ---
  {
    id: "OH-001",
    name: "Blue Express Rancagua",
    address: "Av. Cachapoal 678",
    comuna: "Rancagua",
    city: "Rancagua",
    region: "Región del Libertador Gral. Bernardo O'Higgins",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  // --- Maule ---
  {
    id: "ML-001",
    name: "Blue Express Talca",
    address: "1 Norte 1234",
    comuna: "Talca",
    city: "Talca",
    region: "Región del Maule",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  {
    id: "ML-002",
    name: "Blue Express Curicó",
    address: "Av. Manso de Velasco 320",
    comuna: "Curicó",
    city: "Curicó",
    region: "Región del Maule",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- Ñuble ---
  {
    id: "NB-001",
    name: "Blue Express Chillán",
    address: "Av. O'Higgins 550",
    comuna: "Chillán",
    city: "Chillán",
    region: "Región de Ñuble",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  // --- Biobío ---
  {
    id: "BB-001",
    name: "Blue Express Concepción",
    address: "Av. Libertad 980",
    comuna: "Concepción",
    city: "Concepción",
    region: "Región del Biobío",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  {
    id: "BB-002",
    name: "Blue Express Talcahuano",
    address: "Av. Colón 1200",
    comuna: "Talcahuano",
    city: "Concepción",
    region: "Región del Biobío",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  {
    id: "BB-003",
    name: "Blue Express Los Ángeles",
    address: "Av. Ricardo Vicuña 450",
    comuna: "Los Ángeles",
    city: "Los Ángeles",
    region: "Región del Biobío",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- La Araucanía ---
  {
    id: "AR-001",
    name: "Blue Express Temuco",
    address: "Av. Balmaceda 1050",
    comuna: "Temuco",
    city: "Temuco",
    region: "Región de La Araucanía",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  // --- Los Ríos ---
  {
    id: "LR-001",
    name: "Blue Express Valdivia",
    address: "Av. Ramón Picarte 890",
    comuna: "Valdivia",
    city: "Valdivia",
    region: "Región de Los Ríos",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- Los Lagos ---
  {
    id: "LL-001",
    name: "Blue Express Puerto Montt",
    address: "Av. Presidente Ibáñez 890",
    comuna: "Puerto Montt",
    city: "Puerto Montt",
    region: "Región de Los Lagos",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  {
    id: "LL-002",
    name: "Blue Express Osorno",
    address: "Av. Bilbao 1030",
    comuna: "Osorno",
    city: "Osorno",
    region: "Región de Los Lagos",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- Coquimbo ---
  {
    id: "CQ-001",
    name: "Blue Express La Serena",
    address: "Av. Francisco de Aguirre 345",
    comuna: "La Serena",
    city: "La Serena",
    region: "Región de Coquimbo",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  {
    id: "CQ-002",
    name: "Blue Express Coquimbo",
    address: "Av. Costanera 670",
    comuna: "Coquimbo",
    city: "Coquimbo",
    region: "Región de Coquimbo",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- Antofagasta ---
  {
    id: "AN-001",
    name: "Blue Express Antofagasta",
    address: "Av. Balmaceda 2745",
    comuna: "Antofagasta",
    city: "Antofagasta",
    region: "Región de Antofagasta",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  {
    id: "AN-002",
    name: "Blue Express Calama",
    address: "Av. Granaderos 2050",
    comuna: "Calama",
    city: "Calama",
    region: "Región de Antofagasta",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- Atacama ---
  {
    id: "AT-001",
    name: "Blue Express Copiapó",
    address: "Av. Copayapu 1230",
    comuna: "Copiapó",
    city: "Copiapó",
    region: "Región de Atacama",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- Tarapacá ---
  {
    id: "TA-001",
    name: "Blue Express Iquique",
    address: "Av. Arturo Prat 780",
    comuna: "Iquique",
    city: "Iquique",
    region: "Región de Tarapacá",
    hours: "Lun-Vie 9:00-18:30 / Sáb 9:00-13:00",
  },
  // --- Arica y Parinacota ---
  {
    id: "AP-001",
    name: "Blue Express Arica",
    address: "Av. 18 de Septiembre 450",
    comuna: "Arica",
    city: "Arica",
    region: "Región de Arica y Parinacota",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
  // --- Magallanes ---
  {
    id: "MG-001",
    name: "Blue Express Punta Arenas",
    address: "Av. Colón 890",
    comuna: "Punta Arenas",
    city: "Punta Arenas",
    region: "Región de Magallanes",
    hours: "Lun-Vie 9:00-18:00 / Sáb 9:00-13:00",
  },
];

export const REGIONS_ORDER = [
  "Región Metropolitana",
  "Región de Valparaíso",
  "Región del Libertador Gral. Bernardo O'Higgins",
  "Región del Maule",
  "Región de Ñuble",
  "Región del Biobío",
  "Región de La Araucanía",
  "Región de Los Ríos",
  "Región de Los Lagos",
  "Región de Coquimbo",
  "Región de Atacama",
  "Región de Antofagasta",
  "Región de Tarapacá",
  "Región de Arica y Parinacota",
  "Región de Magallanes",
];

export function getPointById(id: string): BlueExpressPoint | undefined {
  return BLUE_EXPRESS_POINTS.find((p) => p.id === id);
}
