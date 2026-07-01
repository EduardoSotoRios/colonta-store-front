"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

type User = { id: string; nombre: string; email: string; rol: string };

type UserState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem("token", token);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({ error: e?.message ?? "Login failed", loading: false });
    }
  },

  logout() {
    try { localStorage.removeItem("token"); } catch {}
    set({ token: null, user: null });
  },

  hydrate() {
    try {
      const t = localStorage.getItem("token");
      if (t) set({ token: t });
    } catch {}
  },
}));