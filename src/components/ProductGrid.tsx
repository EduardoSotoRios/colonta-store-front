"use client";

import ProductCard from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  slug: string;
  variants: { sku: string; color: string; stock: number }[];
};

export default function ProductGrid({ products }: { products: Product[] }) {
  const { user } = useAuth();
  const { addItem } = useCart();

  const handleBuy = (p: Product) => {
    // Agregar al carrito con estructura CartItem
    addItem({
      productModelId: p.id,
      quantity: 1,
      extras: [],
    }, user);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold">{products.length}</span> productos
        </p>
        <select className="border rounded-xl px-3 py-2 text-sm">
          <option value="destacados">Ordenar: Destacados</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre</option>
        </select>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              onBuy={() => handleBuy(p)}
              href={`/mochilas/${p.id}`}
            />
          </li>
        ))}
      </ul>
    </>
  );
}