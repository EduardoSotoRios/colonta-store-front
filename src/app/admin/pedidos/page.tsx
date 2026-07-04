"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, type Order } from "@/lib/api";
import Link from "next/link";

const ESTADO_STYLES: Record<Order["estado"], string> = {
  pendiente: "bg-amber-100 text-amber-700",
  pagado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(n);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function PedidosAdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPedidos();
  }, []);

  async function loadPedidos() {
    try {
      setLoading(true);
      const data = await api.getAllOrdersAdmin();
      setPedidos(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !user || user.rol !== "admin") {
    return (
      <main className="min-h-screen">
        <section className="bg-colonta-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">Pedidos</h1>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border p-6 bg-white">
              <p>Cargando...</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
            ← Volver al panel
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold">Pedidos</h1>
          <p className="text-white/85 mt-2">Todos los pedidos de la tienda, incluyendo productos personalizados del configurador</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {pedidos.length === 0 && !error && (
            <div className="rounded-2xl ring-1 ring-black/5 bg-white p-6 text-slate-500">
              Aún no hay pedidos.
            </div>
          )}

          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="rounded-2xl ring-1 ring-black/5 bg-white overflow-hidden">
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50">
                  <div>
                    <p className="text-sm text-slate-500">{fmtDate(pedido.createdAt)}</p>
                    <p className="font-semibold">
                      {pedido.user?.nombre ?? "Usuario desconocido"}{" "}
                      <span className="text-slate-400 font-normal">— {pedido.user?.email}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[pedido.estado]}`}>
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                    <span className="font-bold">${fmt(pedido.total)}</span>
                  </div>
                </div>

                <ul className="divide-y">
                  {pedido.items.map((item) => (
                    <li key={item.id} className="px-6 py-4 flex items-center gap-4">
                      {item.customDesignImageUrl ? (
                        <>
                          <img
                            src={item.customDesignImageUrl}
                            alt="Diseño personalizado"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="inline-block mb-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              🎨 Personalizado
                            </span>
                            <p className="font-medium truncate">{item.productName}</p>
                            <p className="text-sm text-slate-500">Cantidad: {item.quantity}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.productName}</p>
                          <p className="text-sm text-slate-500">Cantidad: {item.quantity}</p>
                        </div>
                      )}
                      <span className="font-medium shrink-0">${fmt(item.unitPrice * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
