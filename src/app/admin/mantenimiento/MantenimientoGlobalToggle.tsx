"use client";

import { useState } from "react";
import { setMantenimientoGlobal } from "./actions";

export default function MantenimientoGlobalToggle({ activoInicial }: { activoInicial: boolean }) {
  const [activo, setActivo] = useState(activoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cambiar(nuevoValor: boolean) {
    if (nuevoValor) {
      const ok = confirm(
        "¿Bloquear el sitio para todos los visitantes? Nadie podrá ver productos ni comprar hasta que lo desactives. El panel de administración seguirá funcionando normalmente."
      );
      if (!ok) return;
    }
    setError(null);
    setGuardando(true);
    try {
      await setMantenimientoGlobal(nuevoValor);
      setActivo(nuevoValor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className={`rounded-2xl ring-1 p-6 mb-6 ${activo ? "bg-red-50 ring-red-200" : "bg-white ring-black/5"}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800">Sitio en mantención</p>
          <p className="text-sm text-slate-500 mt-0.5">
            {activo
              ? "El sitio está bloqueado — los visitantes ven una página de \"en mantención\" y no pueden comprar. Tú sigues teniendo acceso completo al panel de administración."
              : "El sitio está funcionando normalmente. Actívalo solo mientras hagas cambios importantes."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => cambiar(!activo)}
          disabled={guardando}
          aria-pressed={activo}
          className={`shrink-0 relative w-14 h-8 rounded-full transition-colors disabled:opacity-50 ${
            activo ? "bg-red-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              activo ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {error && (
        <div className="mt-4 rounded-xl bg-red-100 border border-red-200 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
