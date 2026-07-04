"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

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
    if (get().hydrated || !loggedIn) return;
    try {
      const ids = await api.getFavorites();
      set({ favoriteIds: ids, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  async toggle(productId, loggedIn) {
    if (!loggedIn) return;
    const isFav = get().favoriteIds.includes(productId);
    try {
      const updated = isFav
        ? await api.removeFavorite(productId)
        : await api.addFavorite(productId);
      set({ favoriteIds: updated });
    } catch {}
  },

  isFavorite(productId) {
    return get().favoriteIds.includes(productId);
  },
}));
