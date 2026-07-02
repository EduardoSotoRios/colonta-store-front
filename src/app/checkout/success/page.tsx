    // src/app/checkout/success/page.tsx
import OrderSuccessClient from "@/components/OrderSuccessClient";

export const metadata = {
  title: "Compra realizada | Colonta",
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <section className="bg-colonta-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Tu compra</h1>
          <p className="mt-1 text-white/85">Resumen de la orden</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <OrderSuccessClient />
        </div>
      </section>
    </main>
  );
}