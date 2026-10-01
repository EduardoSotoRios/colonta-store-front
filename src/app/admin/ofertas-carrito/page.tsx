import { getCartOffersAdmin, getProductosSlugs } from "./actions";
import AdminCartOffersClient from "./AdminCartOffersClient";

export const dynamic = "force-dynamic";

export default async function AdminCartOffersPage() {
  let offers: Awaited<ReturnType<typeof getCartOffersAdmin>> = [];
  let productos: Awaited<ReturnType<typeof getProductosSlugs>> = [];
  let configError: string | null = null;

  try {
    [offers, productos] = await Promise.all([getCartOffersAdmin(), getProductosSlugs()]);
  } catch (e: any) {
    configError = e?.message ?? "Error de configuración del servidor.";
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Ofertas de carrito</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Productos que se desbloquean a precio especial cuando el carrito supera un monto mínimo.
        </p>
      </div>
      {configError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">
          Error de configuración: {configError}
        </div>
      )}
      <AdminCartOffersClient offers={offers} productos={productos} />
    </div>
  );
}
