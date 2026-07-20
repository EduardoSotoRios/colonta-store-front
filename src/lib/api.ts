// src/lib/api.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'
// Cliente API real con cookies httpOnly (JWT en cookie auth_token)

const API_BASE_DEFAULT = "http://localhost:4000/api";
export const API = (process.env.NEXT_PUBLIC_API_URL ?? API_BASE_DEFAULT).replace(/\/+$/, "");

// --- Manejo de token (solo para referencia, el backend usa cookies) ---
// El token JWT se almacena en una cookie httpOnly llamada 'auth_token'
// No necesitamos manejar el token manualmente, el navegador lo envía automáticamente

export function setAuthToken(_token: string | null) {
  // El backend maneja el token en cookies, no necesitamos hacer nada aquí
  // Solo mantenemos esta función para compatibilidad con código existente
}

// Construye URL segura con soporte path con/sin "/"
function buildUrl(path: string, params?: Record<string, any>) {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(cleanPath, API + "/");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

// Limpiar objeto eliminando propiedades undefined y null
// Especialmente importante para CartItem que no debe tener ambos colorSchemeId y colorScheme
// También asegura que los precios sean enteros según la API
function cleanObject(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      // Convertir precios a enteros si la clave contiene "price" o "Price"
      if ((key.toLowerCase().includes('price') || key === 'value' || key === 'basePrice' || key === 'baseWeightGrams') && typeof value === 'number') {
        cleaned[key] = Math.round(value);
      } else if (Array.isArray(value)) {
        // Incluir arrays incluso si están vacíos (extras puede ser [], colorSchemeIds puede ser [])
        cleaned[key] = value;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedObj = cleanObject(value);
        if (Object.keys(cleanedObj).length > 0) {
          cleaned[key] = cleanedObj;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

// Transformar ProductModel del backend (con estructura anidada) al formato esperado por el frontend
function transformProductModel(backendProduct: any): ProductModel {
  // Transformar extras: de { id, extraId, extra: { id, name, price, ... } } a { id, name, price, ... }
  const transformedExtras = backendProduct.extras?.map((item: any) => {
    if (item.extra) {
      // Estructura anidada del backend
      return {
        id: item.extra.id,
        name: item.extra.name,
        description: item.extra.description || '',
        price: Number(item.extra.price) || 0,
      };
    } else if (item.id && item.name && item.price !== undefined) {
      // Ya está en formato plano
      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price) || 0,
      };
    }
    return null;
  }).filter((e: any) => e !== null) || [];

  // Transformar colorSchemes si es necesario
  const transformedColorSchemes = backendProduct.colorSchemes?.map((cs: any) => {
    if (cs.colorScheme) {
      // Estructura anidada del backend
      return {
        id: cs.colorScheme.id,
        type: cs.colorScheme.type || 'preset',
        name: cs.colorScheme.name || null,
        colors: cs.colorScheme.colors || [],
      };
    } else if (cs.id && cs.type) {
      // Ya está en formato plano
      return cs;
    }
    return null;
  }).filter((cs: any) => cs !== null) || [];

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    slug: backendProduct.slug,
    category: backendProduct.category,
    basePrice: Number(backendProduct.basePrice) || 0,
    baseWeightGrams: Number(backendProduct.baseWeightGrams) || 0,
    imageUrl: backendProduct.imageUrl || null,
    allowCustomColors: Boolean(backendProduct.allowCustomColors),
    colorSchemes: transformedColorSchemes.length > 0 ? transformedColorSchemes : undefined,
    extras: transformedExtras.length > 0 ? transformedExtras : undefined,
  };
}

// Validar y limpiar CartItem antes de enviarlo
// Asegura que no se envíen propiedades undefined y que no se usen ambos colorSchemeId y colorScheme
function cleanCartItem(item: CartItem): Record<string, any> {
  // Validar que productModelId y quantity existan
  if (!item.productModelId || typeof item.productModelId !== 'string') {
    throw new Error('Invalid CartItem: productModelId is required');
  }
  if (typeof item.quantity !== 'number' || item.quantity < 1) {
    throw new Error('Invalid CartItem: quantity must be a positive number');
  }

  const cleaned: Record<string, any> = {
    productModelId: String(item.productModelId),
    quantity: Number(item.quantity),
    extras: Array.isArray(item.extras) ? item.extras.map(String) : [], // Asegurar que extras sea array de strings
  };

  // Diseño personalizado del configurador (URL de Cloudinary) — se envía al backend.
  // NOTA: unitPrice es solo para mostrar en el carrito local, nunca se envía.
  if (item.customDesignImageUrl) {
    cleaned.customDesignImageUrl = String(item.customDesignImageUrl);
  }

  if (item.productImageUrl) {
    cleaned.productImageUrl = String(item.productImageUrl);
  }

  // ID de la imagen/recolor elegido — sin esto, al recargar el carrito logueado
  // se pierde qué variante exacta se agrego y se cae de vuelta a la imagen principal.
  if (item.imageId !== undefined && item.imageId !== null) {
    cleaned.imageId = Number(item.imageId);
  }

  // Fallback para productos Supabase: enviar nombre y precio al backend
  if (item.productName) {
    cleaned.productName = String(item.productName);
  }
  if (item.unitPrice !== undefined && item.unitPrice !== null) {
    cleaned.unitPrice = Math.round(Number(item.unitPrice));
  }

  // IMPORTANTE: No enviar ambos colorSchemeId y colorScheme
  // Priorizar colorSchemeId si ambos están presentes (aunque no debería pasar)
  if (item.colorSchemeId) {
    cleaned.colorSchemeId = String(item.colorSchemeId);
    // Asegurarse de no incluir colorScheme si ya hay colorSchemeId
  } else if (item.colorScheme && item.colorScheme.type === 'custom') {
    // Solo incluir colorScheme si es tipo custom y tiene colors
    if (Array.isArray(item.colorScheme.colors)) {
      cleaned.colorScheme = {
        type: 'custom',
        name: item.colorScheme.name ? String(item.colorScheme.name) : undefined,
        colors: item.colorScheme.colors.filter(c => typeof c === 'string'),
      };
    }
  }
  
  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('[api] cleanCartItem -> cleaned:', JSON.stringify(cleaned, null, 2));
  }
  
  return cleaned;
}

// Headers con clase Headers
function buildHeaders(body?: any, extra?: HeadersInit) {
  const h = new Headers(extra ?? {});
  if (body != null && !h.has("Content-Type")) h.set("Content-Type", "application/json");
  // No enviamos Authorization header, el backend usa cookies
  return h;
}

// Manejo de respuesta: intenta JSON, si no, texto
async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  
  // Para respuestas 204 No Content, devolver objeto vacío (no hay body)
  if (res.status === 204) {
    return {} as T;
  }
  
  // Leer el texto de la respuesta
  let text: string;
  try {
    text = await res.text();
  } catch (e) {
    // Si falla leer el texto, devolver objeto vacío para JSON o cadena vacía para texto
    console.warn(`Failed to read response text: ${e}`);
    return (isJson ? {} : "") as T;
  }
  
  // Si el texto está vacío o solo espacios
  if (!text || text.trim() === "") {
    // Si el Content-Type indica JSON, devolver objeto vacío
    // Si no, devolver cadena vacía
    return (isJson ? {} : "") as T;
  }
  
  // Intentar parsear como JSON si el Content-Type lo indica o si el texto parece JSON
  if (isJson || (text.trim().startsWith("{") || text.trim().startsWith("["))) {
    try {
      const parsed = JSON.parse(text);
      // Asegurarse de que nunca devolvamos undefined
      return (parsed !== undefined ? parsed : {}) as T;
    } catch (e) {
      // Si falla el parseo pero el Content-Type dice que es JSON, devolver el texto como fallback
      console.warn(`Failed to parse JSON response: ${e}, returning text instead`);
      return text as T;
    }
  }
  
  // Si no es JSON, devolver el texto
  return text as T;
}

type FetchInit = Omit<RequestInit, "headers" | "body" | "method"> & {
  timeoutMs?: number;
  headers?: HeadersInit;
};

async function http<T = any>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  params?: Record<string, any>,
  body?: any,
  init?: FetchInit
): Promise<T> {
  const url = buildUrl(path, params);
  const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timeoutMs = init?.timeoutMs ?? 15000;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  // Limpiar el body antes de enviarlo
  // Si es un CartItem, usar limpieza especial
  let cleanedBody: any = undefined;
  if (body != null) {
    if (body.productModelId !== undefined && body.quantity !== undefined) {
      // Es un CartItem, usar limpieza especial
      cleanedBody = cleanCartItem(body as CartItem);
    } else {
      // Otro tipo de body, usar limpieza general
      cleanedBody = cleanObject(body);
    }
  }
  
  // Log para debugging en desarrollo (especialmente para requests de carrito)
  if (process.env.NODE_ENV === 'development' && cleanedBody?.productModelId) {
    console.log(`[api] ${method} ${url}`, {
      body: cleanedBody,
      bodyStringified: JSON.stringify(cleanedBody),
    });
  }
  
  const res = await fetch(url, {
    method,
    headers: buildHeaders(cleanedBody, init?.headers),
    body: cleanedBody != null ? JSON.stringify(cleanedBody) : undefined,
    cache: "no-store",
    signal: controller?.signal,
    credentials: "include", // Importante: incluir cookies para JWT
    ...init,
  }).catch((e) => {
    if (timer) clearTimeout(timer as any);
    throw new Error(`FETCH ${method} ${url} failed: ${e?.message ?? e}`);
  });

  if (timer) clearTimeout(timer as any);

  if (!res.ok) {
    const payload = await handleResponse<any>(res);
    const msg = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(`${method} ${url} -> ${res.status} ${msg}`);
  }

  const result = await handleResponse<T>(res);
  
  // Si el resultado es undefined y esperamos un tipo específico, lanzar un error informativo
  if (result === undefined && res.status !== 204) {
    console.warn(`Warning: ${method} ${url} returned undefined. Status: ${res.status}, Content-Type: ${res.headers.get("content-type")}`);
  }
  
  return result;
}

// Helpers
async function get<T = any>(path: string, params?: Record<string, any>, init?: FetchInit) {
  return http<T>("GET", path, params, undefined, init);
}
async function post<T = any>(path: string, params?: Record<string, any>, body?: any, init?: FetchInit) {
  return http<T>("POST", path, params, body, init);
}
async function put<T = any>(path: string, params?: Record<string, any>, body?: any, init?: FetchInit) {
  return http<T>("PUT", path, params, body, init);
}
async function del<T = any>(path: string, params?: Record<string, any>, init?: FetchInit) {
  return http<T>("DELETE", path, params, undefined, init);
}
async function patch<T = any>(path: string, params?: Record<string, any>, body?: any, init?: FetchInit) {
  return http<T>("PATCH", path, params, body, init);
}

/* ---------------------------- Tipos compartidos ---------------------------- */
// Tipos alineados con el backend colonta-api

export type ColorSchemeType = 'preset' | 'custom';

export type ColorScheme = {
  type: ColorSchemeType;
  name?: string;
  colors: string[];
};

// CartItem según los ejemplos del backend
// IMPORTANTE: No se puede usar colorSchemeId y colorScheme al mismo tiempo
export type CartItem = {
  productModelId: string;
  quantity: number;
  imageId?: number;            // ID de la imagen seleccionada (solo frontend, no se envía al backend)
  colorSchemeId?: string;      // Para preset - solo uno de los dos
  colorScheme?: {               // Para custom - solo uno de los dos
    type: 'custom';
    name?: string;
    colors: string[];
  };
  extras: string[];            // IDs de extras (siempre presente, puede ser array vacío)
  customDesignImageUrl?: string; // Diseño del configurador (Cloudinary) — se envía al backend
  productImageUrl?: string;    // URL de la imagen del producto seleccionada — se guarda en la orden
  unitPrice?: number;          // Precio del producto — se envía al backend como fallback para productos Supabase
  productName?: string;        // Nombre del producto — se envía al backend como fallback para productos Supabase
};

export type Address = {
  street: string;
  number: string;
  comuna: string;
  region: string;
  postalCode: string;
};

export type BlueExpressDelivery = {
  type: 'blue_express';
  pointId: string;
  name: string;
  address: string;
  comuna: string;
  city: string;
  region: string;
  hours: string;
};

export type DeliveryAddress = Address | BlueExpressDelivery;

export type ProductModel = {
  id: string;
  name: string;
  slug: string;
  category: string;
  basePrice: number;
  baseWeightGrams: number;
  imageUrl: string | null;
  allowCustomColors: boolean;
  colorSchemes?: Array<{
    id: string;
    type: ColorSchemeType;
    name: string | null;
    colors: string[];
  }>;
  extras?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
  }>;
  // Campos extra Colonta
  tagline?: string | null;
  descripcion?: string | null;
  peso_g?: number | null;
  badge?: string | null;
  personalizable?: boolean;
  specs?: Array<{ label: string; valor: string }>;
  caracteristicas?: string[];
  imagenes?: Array<{
    id: number;
    url: string;
    alt: string | null;
    principal: boolean;
    orden: number;
    colores: Array<{ nombre: string; hex: string | null }>;
  }>;
};

export type OrderItem = {
  id: string;
  productModelId: string;
  productName: string;
  quantity: number;
  chosenColorScheme: ColorScheme;
  chosenExtras: Array<{ id: string; name: string; price: number }>;
  unitPrice: number;
  customDesignImageUrl: string | null;
  productImageUrl: string | null;
};

export type Order = {
  id: string;
  userId: string;
  deliveryAddress: DeliveryAddress;
  total: number;
  estado: 'pendiente' | 'pagado' | 'manufactura' | 'enviado' | 'entregado' | 'cancelado';
  trackingCode?: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; nombre: string; email: string; rol: string };
};

export type DiscountCode = {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expirationDate: string | null;
  usageType: 'public' | 'user-only' | 'reserved-email';
  reservedEmail: string | null;
  active: boolean;
};

/* ------------------------------ Endpoints API ------------------------------ */

// Params aceptados por /models
export type ProductsQuery = {
  limit?: number;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sort?: "price_asc" | "price_desc";
};


function normalizeImgUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\/localhost/i.test(url)) return null;
  return url;
}

type ColorEntry = { nombre: string; hex: string | null };
type ColoresMap = Map<number, ColorEntry>;

// Selects usados en todas las queries de productos
const IMG_SELECT   = 'id,url,alt,principal,orden,color,color_secundario,color_terciario,color_cuaternario';
const PROD_SELECT  = `*, producto_specs(*), producto_caracteristicas(*), producto_imagenes(${IMG_SELECT})`;

// Carga los 24 colores de la BD — tabla pequeña, siempre fresca
async function fetchColoresMap(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<ColoresMap> {
  const { data } = await supabase.from('colores').select('id,nombre,hex');
  return new Map((data ?? []).map((c: any) => [c.id as number, { nombre: (c.nombre ?? '').trim(), hex: c.hex ?? null }]));
}

// ─── Supabase: mapea fila → ProductModel ────────────────────────────────────
function mapSupabaseProduct(row: any, coloresMap: ColoresMap): ProductModel {
  const principalImg = row.producto_imagenes?.find((i: any) => i.principal)
                    ?? row.producto_imagenes?.[0];
  return {
    id:               row.id,
    name:             row.nombre,
    slug:             row.slug,
    category:         row.categoria_slug ?? '',
    basePrice:        Number(row.precio ?? 0),
    baseWeightGrams:  Number(row.peso_g ?? 0),
    imageUrl:         normalizeImgUrl(principalImg?.url),
    allowCustomColors: Boolean(row.personalizable),
    colorSchemes:     [],
    extras:           [],
    tagline:          row.tagline ?? null,
    descripcion:      row.descripcion ?? null,
    peso_g:           row.peso_g ? Number(row.peso_g) : null,
    badge:            row.badge ?? null,
    personalizable:   Boolean(row.personalizable),
    specs: (row.producto_specs ?? [])
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((s: any) => ({ label: s.label, valor: s.valor })),
    caracteristicas: (row.producto_caracteristicas ?? [])
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((c: any) => c.texto),
    imagenes: (row.producto_imagenes ?? [])
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((img: any) => ({
        id:        img.id,
        url:       normalizeImgUrl(img.url) ?? '',
        alt:       img.alt ?? null,
        principal: img.principal ?? false,
        orden:     img.orden ?? 0,
        colores:   [img.color, img.color_secundario, img.color_terciario, img.color_cuaternario]
          .filter(Boolean)
          .map((id: number) => coloresMap.get(id))
          .filter((c): c is ColorEntry => c !== undefined),
      })),
  }
}

export const api = {
  /* Health Check - Backend: /api/health */
  health: () => get<{ status: string; timestamp: string }>("/health"),

  /* Auth - Backend: /api/auth */
  login: (email: string, password: string, rememberMe: boolean = true) =>
    post<{
      token: string;
      user: {
        id: string;
        email: string;
        nombre: string;
        rol: string;
        rut: string;
        telefono: string;
        direccion: Address;
      }
    }>(
      "/auth/login",
      undefined,
      { email, password, rememberMe }
    ),
  register: (data: {
    nombre: string;
    email: string;
    password: string;
    rut: string;
    telefono: string;
    direccion: Address;
  }) =>
    post<{ 
      token: string; 
      user: { 
        id: string; 
        email: string; 
        nombre: string; 
        rol: string;
        rut: string;
        telefono: string;
        direccion: Address;
      } 
    }>(
      "/auth/register",
      undefined,
      data
    ),
  me: () => get<{ 
    id: string; 
    email: string; 
    nombre: string; 
    rol: string;
    rut: string;
    telefono: string;
    direccion: Address;
  }>("/auth/me"),
  logout: () => post<{ ok: true }>("/auth/logout"),

  /* Mochilas/Productos - Backend: /api/models */
  // Alias para mantener compatibilidad
  productsIndex: (params?: ProductsQuery) => 
    get<any[]>("/models", params).then(products => {
      if (!products || !Array.isArray(products)) return [];
      return products.map(transformProductModel);
    }),
  productById: (id: string) => 
    get<any>(`/models/${id}`).then(product => {
      if (!product) throw new Error("Product not found");
      return transformProductModel(product);
    }),
  productBySlug: (slug: string) => 
    get<any>(`/models/slug/${slug}`).then(product => {
      if (!product) throw new Error("Product not found");
      return transformProductModel(product);
    }),
  createProduct: (data: Partial<ProductModel>) =>
    post<ProductModel>("/models", undefined, data), // Admin only
  updateProduct: (id: string, data: Partial<ProductModel>) =>
    put<ProductModel>(`/models/${id}`, undefined, data), // Admin only
  deleteProduct: (id: string) =>
    del<{ success: boolean }>(`/models/${id}`), // Admin only
  
  // Métodos principales usando "mochilas" como nombre — leen desde Supabase
  getMochilas: async (params?: ProductsQuery): Promise<ProductModel[]> => {
    const supabase = await createSupabaseServerClient()
    const coloresMap = await fetchColoresMap(supabase)
    let query = supabase
      .from('productos_completos')
      .select(PROD_SELECT)
      .eq('categoria_slug', 'mochilas')
      .limit(params?.limit ?? 100)

    if (params?.q)                           query = query.ilike('nombre', `%${params.q}%`)
    if (typeof params?.minPrice === 'number') query = query.gte('precio', params.minPrice)
    if (typeof params?.maxPrice === 'number') query = query.lte('precio', params.maxPrice)
    if (params?.sort === 'price_asc')        query = query.order('precio', { ascending: true })
    else if (params?.sort === 'price_desc')  query = query.order('precio', { ascending: false })
    else                                      query = query.order('orden',  { ascending: true })

    const { data, error } = await query
    if (error) throw new Error(`getMochilas: ${error.message}`)
    return (data ?? []).map(r => mapSupabaseProduct(r, coloresMap))
  },

  getMochilaById: async (id: string): Promise<ProductModel> => {
    const supabase = await createSupabaseServerClient()
    const [coloresMap, { data, error }] = await Promise.all([
      fetchColoresMap(supabase),
      supabase.from('productos_completos').select(PROD_SELECT)
        .eq('id', id).eq('categoria_slug', 'mochilas').single(),
    ])
    if (error || !data) throw new Error('Product not found')
    return mapSupabaseProduct(data, coloresMap)
  },

  getMochilaBySlug: async (slug: string): Promise<ProductModel> => {
    const supabase = await createSupabaseServerClient()
    const [coloresMap, { data, error }] = await Promise.all([
      fetchColoresMap(supabase),
      supabase.from('productos_completos').select(PROD_SELECT)
        .eq('slug', slug).eq('categoria_slug', 'mochilas').single(),
    ])
    if (error || !data) throw new Error('Product not found')
    return mapSupabaseProduct(data, coloresMap)
  },
  createMochila: (data: Partial<ProductModel>) =>
    post<ProductModel>("/models", undefined, data), // Admin only

  // Todos los productos (todas las categorías) — lee desde Supabase
  getTodosLosProductos: async (params?: ProductsQuery): Promise<ProductModel[]> => {
    const supabase = await createSupabaseServerClient()
    const coloresMap = await fetchColoresMap(supabase)
    let query = supabase
      .from('productos_completos')
      .select(PROD_SELECT)
      .limit(params?.limit ?? 100)

    if (params?.q)                            query = query.ilike('nombre', `%${params.q}%`)
    if (typeof params?.minPrice === 'number') query = query.gte('precio', params.minPrice)
    if (typeof params?.maxPrice === 'number') query = query.lte('precio', params.maxPrice)
    if (params?.category) {
      const slugMap: Record<string, string> = {
        mochilas: 'mochilas', bananos: 'bananos', bolsos: 'bolsos',
        notebook: 'notebook', accesorios: 'accesorios',
        'porta notebook': 'notebook',
      }
      const slug = slugMap[params.category.toLowerCase()] ?? params.category.toLowerCase()
      query = query.eq('categoria_slug', slug)
    }
    if (params?.sort === 'price_asc')       query = query.order('precio', { ascending: true })
    else if (params?.sort === 'price_desc') query = query.order('precio', { ascending: false })
    else                                     query = query.order('categoria_id', { ascending: true })
                                                          .order('orden',        { ascending: true })

    const { data, error } = await query
    if (error) throw new Error(`getTodosLosProductos: ${error.message}`)
    return (data ?? []).map(r => mapSupabaseProduct(r, coloresMap))
  },

  // Detalle de cualquier producto por id — lee desde Supabase
  getProductoById: async (id: string): Promise<ProductModel> => {
    const supabase = await createSupabaseServerClient()
    const [coloresMap, { data, error }] = await Promise.all([
      fetchColoresMap(supabase),
      supabase.from('productos_completos').select(PROD_SELECT).eq('id', id).single(),
    ])
    if (error || !data) throw new Error('Product not found')
    return mapSupabaseProduct(data, coloresMap)
  },

  /* Categorías - Se extraen de los productos, no hay endpoint dedicado */
  // Nota: El backend no tiene un endpoint /models/categories
  // Las categorías se obtienen extrayendo valores únicos de los productos
  categoriesIndex: () => Promise.resolve([]), // Deprecated: usar getCategoriasFromProducts
  getCategorias: () => Promise.resolve([]), // Deprecated: extraer de productos directamente

  /* Favoritos - Backend: /api/favorites (los favoritos están en el JWT) */
  getFavorites: () => get<{ favorites: string[] }>("/favorites").then(r => r.favorites ?? []),
  addFavorite: (productModelId: string) =>
    post<{ favorites: string[] }>(`/favorites/${productModelId}`).then(r => r.favorites ?? []),
  removeFavorite: (productModelId: string) =>
    del<{ favorites: string[] }>(`/favorites/${productModelId}`).then(r => r.favorites ?? []),

  /* Carrito - Backend: /api/cart (el carrito está en el JWT) */
  getCart: () => get<{ cart: CartItem[] }>("/cart").then(res => res.cart || []),
  addToCart: (item: CartItem) =>
    post<{ cart: CartItem[] }>("/cart", undefined, item).then(res => ({ cart: res.cart || [] })),
  updateCartItem: (index: number, updates: Partial<CartItem>) =>
    put<{ cart: CartItem[] }>(`/cart/${index}`, undefined, updates).then(res => ({ cart: res.cart || [] })),
  removeCartItem: (index: number) =>
    del<{ cart: CartItem[] }>(`/cart/${index}`).then(res => ({ cart: res.cart || [] })),
  clearCart: () => del<{ cart: CartItem[] }>("/cart").then(res => ({ cart: res.cart || [] })),

  /* Órdenes - Backend: /api/orders */
  createOrder: (data: {
    items: CartItem[];
    deliveryAddress: DeliveryAddress;
    discountCode?: string;
    shippingCost?: number;
  }) => post<Order>("/orders", undefined, data),
  getOrders: () => get<Order[]>("/orders"),
  getOrderById: (id: string) => get<Order>(`/orders/${id}`),
  getAllOrdersAdmin: () => get<Order[]>("/orders/admin"),
  updateOrderStatus: (id: string, estado: Order["estado"]) =>
    patch<Order>(`/orders/${id}/status`, undefined, { estado }),
  updateOrderTracking: (id: string, trackingCode: string | null) =>
    patch<Order>(`/orders/${id}/tracking`, undefined, { trackingCode }),

  /* Pagos - Backend: /api/payments */
  startWebpay: (payload: {
    items: CartItem[];
    deliveryAddress: Record<string, unknown>;
    couponCode?: string;
    shippingCost: number;
  }) =>
    post<{ token: string; url: string }>("/payments/create", undefined, payload),

  /* Cupones/Descuentos - Backend: /api/discounts */
  validateDiscountCode: async (code: string) => {
    const response = await get<{ 
      valid: boolean; 
      discount?: {
        id: string;
        code: string;
        type: 'percent' | 'fixed';
        value: number;
        expirationDate?: string;
        usageType?: string;
        reservedEmail?: string | null;
      };
      code?: string;
      type?: 'percent' | 'fixed';
      value?: number;
      message?: string;
    }>(
      "/discounts/validate",
      { code }
    );
    
    // El backend devuelve los datos dentro de un objeto 'discount'
    if (response.valid && response.discount) {
      return {
        valid: true,
        code: response.discount.code,
        type: response.discount.type,
        value: response.discount.value,
        message: `Cupón ${response.discount.code} aplicado: ${response.discount.type === 'percent' ? `${response.discount.value}%` : `$${response.discount.value}`} de descuento`
      };
    }
    
    // Fallback: si viene directamente (compatibilidad)
    if (response.valid && response.code) {
      return {
        valid: true,
        code: response.code,
        type: response.type || 'fixed',
        value: response.value || 0,
        message: response.message
      };
    }
    
    // Cupón inválido
    return {
      valid: false,
      code: code,
      message: response.message || "Cupón inválido"
    };
  },
  getDiscountCodes: () => get<DiscountCode[]>("/discounts"), // Admin only
  createDiscountCode: (data: Partial<DiscountCode>) =>
    post<DiscountCode>("/discounts", undefined, data), // Admin only
  updateDiscountCode: (id: string, data: Partial<DiscountCode>) =>
    put<DiscountCode>(`/discounts/${id}`, undefined, data), // Admin only
  deleteDiscountCode: (id: string) =>
    del<{ success: boolean }>(`/discounts/${id}`), // Admin only

  /* Colores/ColorSchemes - Backend: /api/colors/schemes */
  getColorSchemes: () => 
    get<Array<{ 
      id: string; 
      type: ColorSchemeType; 
      name: string | null; 
      colors: string[]; 
      createdAt: string;
      productModels?: any[];
    }>>("/colors/schemes").then(schemes => 
      schemes.map(scheme => ({
        id: scheme.id,
        type: scheme.type,
        name: scheme.name,
        colors: scheme.colors,
      }))
    ), // Admin only - transformamos para quitar campos extra
  createColorScheme: (data: { type: ColorSchemeType; name?: string; colors: string[] }) =>
    post<{ id: string; type: ColorSchemeType; name: string | null; colors: string[]; createdAt: string }>("/colors/schemes", undefined, data).then(scheme => ({
      id: scheme.id,
      type: scheme.type,
      name: scheme.name,
      colors: scheme.colors,
    })), // Admin only
  updateColorScheme: (id: string, data: { type?: ColorSchemeType; name?: string; colors?: string[] }) =>
    put<{ id: string; type: ColorSchemeType; name: string | null; colors: string[]; createdAt: string }>(`/colors/schemes/${id}`, undefined, data).then(scheme => ({
      id: scheme.id,
      type: scheme.type,
      name: scheme.name,
      colors: scheme.colors,
    })), // Admin only
  deleteColorScheme: (id: string) =>
    del<{ success: boolean }>(`/colors/schemes/${id}`), // Admin only
  
  /* Colores - Backend: /api/colors (obtiene solo array de colores) */
  getColors: () => get<string[]>("/colors"), // Admin only

  /* Extras - Backend: /api/extras (asumiendo que existe) */
  getExtras: () => get<Array<{ id: string; name: string; description: string; price: number }>>("/extras"), // Admin only
  createExtra: (data: { name: string; description: string; price: number }) =>
    post<{ id: string; name: string; description: string; price: number }>("/extras", undefined, data), // Admin only
  updateExtra: (id: string, data: { name?: string; description?: string; price?: number }) =>
    put<{ id: string; name: string; description: string; price: number }>(`/extras/${id}`, undefined, data), // Admin only
  deleteExtra: (id: string) =>
    del<{ success: boolean }>(`/extras/${id}`), // Admin only

  /* Usuarios - Backend: /api/users */
  getUsers: () => get<Array<{
    id: string;
    email: string;
    nombre: string;
    rol: string;
    rut: string;
    telefono: string;
    direccion: Address;
  }>>("/users"), // Admin only
  getUserById: (id: string) => get<{
    id: string;
    email: string;
    nombre: string;
    rol: string;
    rut: string;
    telefono: string;
    direccion: Address;
  }>(`/users/${id}`), // Admin only
  createUser: (data: {
    nombre: string;
    email: string;
    password: string;
    rut: string;
    telefono: string;
    direccion: Address;
    rol?: string;
  }) => post<{
    id: string;
    email: string;
    nombre: string;
    rol: string;
    rut: string;
    telefono: string;
    direccion: Address;
  }>("/users", undefined, data), // Admin only
  updateUser: (id: string, data: Partial<{
    nombre: string;
    email: string;
    password: string;
    rut: string;
    telefono: string;
    direccion: Address;
    rol: string;
  }>) => put<{
    id: string;
    email: string;
    nombre: string;
    rol: string;
    rut: string;
    telefono: string;
    direccion: Address;
  }>(`/users/${id}`, undefined, data), // Admin only
  deleteUser: (id: string) => del<{ success: boolean }>(`/users/${id}`), // Admin only

  updateProfile: (data: {
    nombre?: string;
    email?: string;
    password?: string;
    telefono?: string;
    direccion?: Address;
  }) =>
    patch<{
      id: string; nombre: string; email: string; rol: string;
      rut: string; telefono: string; direccion: Address;
    }>("/users/me", undefined, data),
};