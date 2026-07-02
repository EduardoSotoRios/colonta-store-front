// src/hooks/useCartUI.ts
"use client";
import { create } from "zustand";
type UI = { isCartOpen: boolean; openCart: () => void; closeCart: () => void; toggleCart: () => void; };
export const useCartUI = create<UI>((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
}));