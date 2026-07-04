// src/hooks/useCart.ts
"use client";

import { create } from "zustand";
import {
  api,
  type CartItem,
  type Address,
  type Order,
  type ProductModel,
} from "@/lib/api";

const LOCAL_CART_KEY = "colonta_local_cart";

// Funciones para manejar el carrito local
function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("[cart] Error saving local cart:", e);
  }
}

function clearLocalCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_CART_KEY);
  } catch {}
}

type State = {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  products: Record<string, ProductModel>; // Cache de productos para mostrar info

  coupon: { code: string; message?: string; type?: 'percent' | 'fixed'; value?: number; valid?: boolean } | null;
  order: Order | null;
};

type Actions = {
  loadCart: (user?: { id: string } | null) => Promise<void>;
  addItem: (item: CartItem, user?: { id: string } | null) => Promise<void>;
  updateItem: (index: number, updates: Partial<CartItem>, user?: { id: string } | null) => Promise<void>;
  removeItem: (index: number, user?: { id: string } | null) => Promise<void>;
  clearCart: (user?: { id: string } | null) => Promise<void>;
  mergeLocalCart: () => Promise<void>; // Fusionar carrito local con servidor

  applyCoupon: (code: string) => Promise<void>;
  createOrder: (deliveryAddress: Address, discountCode?: string) => Promise<Order>;
  getOrders: () => Promise<Order[]>;
  getOrderById: (id: string) => Promise<Order | null>;

  reset: () => void;
};

export const useCart = create<State & Actions>((set, get) => ({
  cart: [],
  loading: false,
  error: null,
  products: {},
  coupon: null,
  order: null,

  async loadCart(user) {
    set({ loading: true, error: null });
    
    // Si no hay usuario, cargar desde localStorage
    if (!user) {
      const localCart = getLocalCart();
      set({ cart: localCart, loading: false });
      
      // Cargar información de productos si hay items (los diseños personalizados
      // no existen en Supabase, no tiene sentido buscarlos ahí)
      const localCartCatalog = localCart.filter(item => !item.customDesignImageUrl);
      if (localCartCatalog.length > 0) {
        const productIds = [...new Set(localCartCatalog.map(item => item.productModelId))];
        const productPromises = productIds.map(id => 
          api.getProductoById(id).catch(() => null)
        );
        const loadedProducts = await Promise.all(productPromises);
        const productsMap: Record<string, ProductModel> = {};
        loadedProducts.forEach((product, index) => {
          if (product) {
            productsMap[productIds[index]] = product;
          }
        });
        set({ products: productsMap });
      } else {
        set({ products: {} });
      }
      return;
    }

    // Si hay usuario, cargar desde el servidor
    try {
      const cart = await api.getCart();
      const cartArray = Array.isArray(cart) ? cart : [];
      set({ cart: cartArray, loading: false });

      const cartArrayCatalog = cartArray.filter(item => !item.customDesignImageUrl);
      if (cartArrayCatalog.length > 0) {
        const productIds = [...new Set(cartArrayCatalog.map(item => item.productModelId))];
        const productPromises = productIds.map(id => 
          api.getProductoById(id).catch(() => null)
        );
        const loadedProducts = await Promise.all(productPromises);
        const productsMap: Record<string, ProductModel> = {};
        loadedProducts.forEach((product, index) => {
          if (product) {
            productsMap[productIds[index]] = product;
          }
        });
        set({ products: productsMap });
      } else {
        set({ products: {} });
      }
    } catch (e: any) {
      const errorMessage = e?.message ?? "";
      const isAuthError = errorMessage.includes("401") || errorMessage.includes("No token") || errorMessage.includes("Invalid or expired");
      const isNotFoundError = errorMessage.includes("404");
      
      if (isAuthError || isNotFoundError) {
        set({ cart: [], loading: false, error: null, products: {} });
      } else {
        console.error("[cart] loadCart error:", e);
        set({ loading: false, error: errorMessage || "Error al cargar el carrito" });
      }
    }
  },

  async mergeLocalCart() {
    const localCart = getLocalCart();
    if (localCart.length === 0) {
      clearLocalCart();
      return;
    }

    try {
      // Obtener carrito del servidor
      const serverCart = await api.getCart();
      const serverCartArray = Array.isArray(serverCart) ? serverCart : [];
      
      // Enviar cada item del carrito local al servidor
      // El servidor manejará la lógica de fusión/duplicados
      for (const localItem of localCart) {
        try {
          await api.addToCart(localItem);
        } catch (e) {
          console.error("[cart] Error merging item:", e);
        }
      }
      
      // Recargar el carrito completo del servidor después de agregar todos los items
      const finalCart = await api.getCart();
      const finalCartArray = Array.isArray(finalCart) ? finalCart : [];
      
      // Limpiar carrito local después de fusionar exitosamente
      clearLocalCart();
      
      // Actualizar estado
      set({ cart: finalCartArray });
      
      // Cargar información de productos
      const finalCartArrayCatalog = finalCartArray.filter(item => !item.customDesignImageUrl);
      if (finalCartArrayCatalog.length > 0) {
        const productIds = [...new Set(finalCartArrayCatalog.map(item => item.productModelId))];
        const productPromises = productIds.map(id => 
          api.getProductoById(id).catch(() => null)
        );
        const loadedProducts = await Promise.all(productPromises);
        const productsMap: Record<string, ProductModel> = {};
        loadedProducts.forEach((product, index) => {
          if (product) {
            productsMap[productIds[index]] = product;
          }
        });
        set({ products: productsMap });
      }
    } catch (e: any) {
      console.error("[cart] Error merging local cart:", e);
      // Si falla, mantener el carrito local para que el usuario no pierda sus items
    }
  },

  async addItem(item, user) {
    // Si no hay usuario, guardar en localStorage
    if (!user) {
      try {
        const currentCart = get().cart;
        const newCart = [...currentCart, item];
        set({ cart: newCart, error: null });
        saveLocalCart(newCart);
        
        // Cargar info de producto si es necesario (los diseños personalizados
        // no existen en Supabase, no tiene sentido buscarlos ahí)
        if (!item.customDesignImageUrl && !get().products[item.productModelId]) {
          try {
            const product = await api.getProductoById(item.productModelId);
            set({ products: { ...get().products, [item.productModelId]: product } });
          } catch {
            // Ignorar errores al cargar mochila
          }
        }
      } catch (e: any) {
        console.error("[cart] addItem (local) ERROR ->", e);
        set({ error: e?.message ?? "No se pudo agregar al carrito" });
      }
      return;
    }

    // Si hay usuario, guardar en el servidor
    try {
      const response = await api.addToCart(item);
      const cart = Array.isArray(response.cart) ? response.cart : [];
      set({ cart, error: null });
      // Recargar info de mochila si es necesario (los diseños personalizados
      // no existen en Supabase, no tiene sentido buscarlos ahí)
      if (!item.customDesignImageUrl && !get().products[item.productModelId]) {
        try {
          const product = await api.getProductoById(item.productModelId);
          set({ products: { ...get().products, [item.productModelId]: product } });
        } catch {
          // Ignorar errores al cargar mochila
        }
      }
    } catch (e: any) {
      console.error("[cart] addItem ERROR ->", e);
      set({ error: e?.message ?? "No se pudo agregar al carrito" });
    }
  },

  async updateItem(index, updates, user) {
    // Si no hay usuario, actualizar en localStorage
    if (!user) {
      try {
        const currentCart = [...get().cart];
        if (index >= 0 && index < currentCart.length) {
          currentCart[index] = { ...currentCart[index], ...updates };
          set({ cart: currentCart, error: null });
          saveLocalCart(currentCart);
        }
      } catch (e: any) {
        console.error("[cart] updateItem (local) ERROR ->", e);
        set({ error: e?.message ?? "No se pudo actualizar el carrito" });
      }
      return;
    }

    // Si hay usuario, actualizar en el servidor
    try {
      const response = await api.updateCartItem(index, updates);
      const cart = Array.isArray(response.cart) ? response.cart : [];
      set({ cart, error: null });
    } catch (e: any) {
      console.error("[cart] updateItem ERROR ->", e);
      set({ error: e?.message ?? "No se pudo actualizar el carrito" });
    }
  },

  async removeItem(index, user) {
    // Si no hay usuario, eliminar de localStorage
    if (!user) {
      try {
        const currentCart = [...get().cart];
        if (index >= 0 && index < currentCart.length) {
          currentCart.splice(index, 1);
          set({ cart: currentCart, error: null });
          saveLocalCart(currentCart);
        }
      } catch (e: any) {
        console.error("[cart] removeItem (local) ERROR ->", e);
        set({ error: e?.message ?? "No se pudo eliminar del carrito" });
      }
      return;
    }

    // Si hay usuario, eliminar del servidor
    try {
      const response = await api.removeCartItem(index);
      const cart = Array.isArray(response.cart) ? response.cart : [];
      set({ cart, error: null });
    } catch (e: any) {
      console.error("[cart] removeItem ERROR ->", e);
      set({ error: e?.message ?? "No se pudo eliminar del carrito" });
    }
  },

  async clearCart(user) {
    // Si no hay usuario, limpiar localStorage
    if (!user) {
      try {
        set({ cart: [], error: null });
        clearLocalCart();
      } catch (e: any) {
        console.error("[cart] clearCart (local) ERROR ->", e);
        set({ error: e?.message ?? "No se pudo vaciar el carrito" });
      }
      return;
    }

    // Si hay usuario, limpiar en el servidor
    try {
      const response = await api.clearCart();
      const cart = Array.isArray(response.cart) ? response.cart : [];
      set({ cart, error: null });
    } catch (e: any) {
      console.error("[cart] clearCart ERROR ->", e);
      set({ error: e?.message ?? "No se pudo vaciar el carrito" });
    }
  },

  async applyCoupon(code) {
    try {
      const data = await api.validateDiscountCode(code);
      console.log("[cart] applyCoupon response:", data);
      
      if (data.valid) {
        const couponData = {
          code: data.code || code,
          type: data.type || 'fixed',
          value: data.value || 0,
          message: data.message,
          valid: true
        };
        console.log("[cart] Setting coupon:", couponData);
        set({ coupon: couponData });
      } else {
        set({ coupon: { code, message: data.message ?? "Cupón inválido", valid: false } });
      }
    } catch (e: any) {
      console.error("[cart] applyCoupon ERROR ->", e);
      set({ error: e?.message ?? "Error al aplicar cupón" });
      set({ coupon: { code, message: e?.message ?? "Error al validar cupón", valid: false } });
    }
  },

  async createOrder(deliveryAddress, discountCode) {
    try {
      const cart = get().cart;
      if (cart.length === 0) {
        throw new Error("El carrito está vacío");
      }
      const order = await api.createOrder({
        items: cart,
        deliveryAddress,
        discountCode,
      });
      set({ order, error: null });
      // Limpiar carrito después de crear la orden
      await get().clearCart();
      return order;
    } catch (e: any) {
      console.error("[cart] createOrder ERROR ->", e);
      set({ error: e?.message ?? "No se pudo crear la orden" });
      throw e;
    }
  },

  async getOrders() {
    try {
      const orders = await api.getOrders();
      return orders;
    } catch (e: any) {
      console.error("[cart] getOrders ERROR ->", e);
      set({ error: e?.message ?? "Error al cargar las órdenes" });
      return [];
    }
  },

  async getOrderById(id) {
    try {
      const order = await api.getOrderById(id);
      return order;
    } catch (e: any) {
      console.error("[cart] getOrderById ERROR ->", e);
      return null;
    }
  },

  reset() {
    clearLocalCart();
    set({
      cart: [],
      loading: false,
      error: null,
      products: {},
      coupon: null,
      order: null,
    });
  },
}));