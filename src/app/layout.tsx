// src/app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { Montserrat } from "next/font/google";
import Header from "@/components/Header";
import CartSidebar from "@/components/CartSidebar";
import FloatingCartButton from "@/components/FloatingCartButton";
import Footer from "@/components/Footer";
import CartBootstrap from "@/components/CartBootstrap"; // ← hidrata el carrito al montar

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Colonta | Mochilas con esencia",
  description:
    "Mochilas y accesorios Colonta: viaje, urbano y día a día. Personaliza la tuya y vive tus sueños junto a Colonta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} font-sans`}>
        {/* Hidrata el carrito apenas carga la app */}
        <CartBootstrap />

        <Header />
        {children}
        <CartSidebar />
        <FloatingCartButton />
        <Footer />
      </body>
    </html>
  );
}