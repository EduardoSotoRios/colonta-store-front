"use client";

import { create } from "zustand";
import { api, setAuthToken } from "@/lib/api";
import type { Address } from "@/lib/api";

type User = { 
  id: string; 
  nombre: string; 
  email: string; 
  rol: string; 
  rut: string;
  telefono: string;
  direccion: Address;
};

type State = {
  user: User | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean; // para saber si ya intentamos cargar /me
};

type Actions = {
  hydrate: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: {
    nombre: string;
    email: string;
    password: string;
    rut: string;
    telefono: string;
    direccion: Address;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    nombre?: string;
    email?: string;
    password?: string;
    telefono?: string;
    direccion?: Address;
  }) => Promise<void>;
};

export const useAuth = create<State & Actions>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  hydrated: false,

  async hydrate() {
    // Intenta leer /auth/me si hay cookie de autenticación
    try {
      set({ loading: true, error: null });
      const user = await api.me();
      set({ user, loading: false, hydrated: true });
    } catch {
      set({ loading: false, hydrated: true, user: null });
    }
  },

  async login(email, password, rememberMe = true) {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api.login(email, password, rememberMe);
      // El token se guarda en cookie httpOnly por el backend
      // Solo guardamos la referencia del usuario
      setAuthToken(token);
      // Obtener información completa del usuario incluyendo dirección
      try {
        const fullUser = await api.me();
        set({ user: fullUser, loading: false, hydrated: true });
        
        // Fusionar carrito local con el del servidor después de login
        // Importar dinámicamente para evitar dependencias circulares
        const { useCart } = await import("./useCart");
        const mergeLocalCart = useCart.getState().mergeLocalCart;
        await mergeLocalCart();
      } catch {
        // Si falla /me, usar la información básica del login
        set({ user, loading: false, hydrated: true });
        
        // Intentar fusionar carrito local de todas formas
        try {
          const { useCart } = await import("./useCart");
          const mergeLocalCart = useCart.getState().mergeLocalCart;
          await mergeLocalCart();
        } catch {}
      }
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "Error de autenticación" });
      throw e;
    }
  },

  async register(data) {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api.register(data);
      // El token se guarda en cookie httpOnly por el backend
      setAuthToken(token);
      // Obtener información completa del usuario incluyendo dirección
      try {
        const fullUser = await api.me();
        set({ user: fullUser, loading: false, hydrated: true });
        
        // Fusionar carrito local con el del servidor después de registro
        const { useCart } = await import("./useCart");
        const mergeLocalCart = useCart.getState().mergeLocalCart;
        await mergeLocalCart();
      } catch {
        // Si falla /me, usar la información básica del register
        set({ user, loading: false, hydrated: true });
        
        // Intentar fusionar carrito local de todas formas
        try {
          const { useCart } = await import("./useCart");
          const mergeLocalCart = useCart.getState().mergeLocalCart;
          await mergeLocalCart();
        } catch {}
      }
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "No se pudo registrar" });
      throw e;
    }
  },

  async logout() {
    try {
      await api.logout();
    } catch {
      // Ignorar errores en logout
    }
    setAuthToken(null);
    set({ user: null });
    // Limpiar el carrito (y su cache de "ultimo visto") para que en un
    // computador compartido el siguiente usuario no vea ni por un instante
    // el carrito de la sesion anterior al recargar la pagina.
    try {
      const { useCart } = await import("./useCart");
      useCart.getState().reset();
    } catch {}
  },

  async updateProfile(data) {
    set({ loading: true, error: null });
    try {
      const updated = await api.updateProfile(data);
      set({ user: updated, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "No se pudo actualizar el perfil" });
      throw e;
    }
  },
}));