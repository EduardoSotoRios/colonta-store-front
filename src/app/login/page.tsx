"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error } = useAuth();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  // Solo rutas internas para evitar open redirect
  const rawRedirect = searchParams.get("redirect") ?? "";
  const redirectTo  = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/mochilas";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    try {
      await login(email.trim(), password);
      setSuccess(true);
      await new Promise(r => setTimeout(r, 1500));
      router.push(redirectTo);
    } catch (err: any) {
      setLocalError(err?.message ?? "Error al iniciar sesión");
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800">¡Bienvenido de vuelta!</p>
          <p className="text-sm text-slate-500">Redirigiendo...</p>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className="h-1 bg-colonta-primary rounded-full animate-[progress_1.4s_ease-in-out_forwards]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-colonta-primary">
            Iniciar sesión
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Accede a tu cuenta Colonta
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-colonta-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-colonta-primary focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {(error || localError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error || localError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-colonta-primary text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-colonta-primary font-semibold">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}
