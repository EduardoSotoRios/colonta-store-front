"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

const LS_KEY = "colonta_favorites";

function loadFromLS(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
}

function saveToLS(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

type State = {
  favoriteIds: string[];
  hydrated: boolean;
};

type Actions = {
  hydrate: (loggedIn: boolean) => Promise<void>;
  toggle: (productId: string, loggedIn: boolean) => Promise<void>;
  isFavorite: (productId: string) => boolean;
};

export const useFavorites = create<State & Actions>((set, get) => ({
  favoriteIds: [],
  hydrated: false,

  async hydrate(loggedIn) {
    if (get().hydrated) return;
    if (loggedIn) {
      try {
        const ids = await api.getFavorites();
        set({ favoriteIds: ids, hydrated: true });
        return;
      } catch { /* fallthrough to localStorage */ }
    }
    set({ favoriteIds: loadFromLS(), hydrated: true });
  },

  async toggle(productId, loggedIn) {
    const current = get().favoriteIds;
    const isFav = current.includes(productId);

    if (loggedIn) {
      try {
        const updated = isFav
          ? await api.removeFavorite(productId)
          : await api.addFavorite(productId);
        set({ favoriteIds: updated });
        return;
      } catch { /* fallthrough to localStorage */ }
    }

    const updated = isFav
      ? current.filter(id => id !== productId)
      : [...current, productId];
    saveToLS(updated);
    set({ favoriteIds: updated });
  },

  isFavorite(productId) {
    return get().favoriteIds.includes(productId);
  },
}));
