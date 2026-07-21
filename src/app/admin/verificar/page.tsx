import { verificarPin } from "./actions";

export default async function VerificarPinPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp          = await searchParams;
  const redirectTo  = sp.redirect ?? "/admin";
  const error       = sp.error === "1";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center space-y-1">
          <img src="/logo.png" alt="Colonta" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-extrabold text-slate-800">Verificación de administrador</h1>
          <p className="text-sm text-slate-500">Ingresa el PIN para continuar al panel.</p>
        </div>

        <form action={verificarPin} className="bg-white rounded-2xl ring-1 ring-black/5 p-6 space-y-4">
          <input type="hidden" name="redirect" value={redirectTo} />

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              PIN incorrecto. Intenta de nuevo.
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
              PIN de acceso
            </label>
            <input
              type="password"
              name="pin"
              required
              autoFocus
              autoComplete="off"
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-colonta-primary tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 transition-opacity text-sm"
          >
            Verificar
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          La sesión de verificación dura 4 horas.
        </p>
      </div>
    </main>
  );
}
