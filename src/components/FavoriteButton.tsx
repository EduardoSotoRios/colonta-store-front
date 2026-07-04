"use client";

import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useEffect } from "react";

export default function FavoriteButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const { user } = useAuth();
  const { hydrate, toggle, isFavorite } = useFavorites();

  useEffect(() => {
    hydrate(!!user);
  }, [user, hydrate]);

  const fav = isFavorite(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId, !!user);
      }}
      aria-label={fav ? "Quitar de favoritos" : "Añadir a favoritos"}
      className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 transition-colors ${
        fav
          ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-red-400"
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
