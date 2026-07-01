"use client";
import dynamic from "next/dynamic";

// El carrito depende de localStorage — sin SSR no hay hydration mismatch
const CartClient = dynamic(() => import("./_client"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Tu carrito</h1>
        </div>
      </section>
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border p-6 bg-white animate-pulse h-32" />
        </div>
      </section>
    </main>
  ),
});

export default function CartPage() {
  return <CartClient />;
}
