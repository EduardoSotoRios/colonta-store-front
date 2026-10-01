"use client";

import FavoriteButton from "./FavoriteButton";

type Props = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl: string;
  href?: string;
  onBuy?: () => void;
};

export default function ProductCard({ id, name, price, salePrice, imageUrl, href = "#", onBuy }: Props) {
  const priceCL     = new Intl.NumberFormat("es-CL").format(price);
  const salePriceCL = salePrice ? new Intl.NumberFormat("es-CL").format(salePrice) : null;
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 flex flex-col">
      <a href={href} className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 block relative">
        <img className="w-full h-full object-cover" src={imageUrl} alt={name} />
        {salePriceCL && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            OFERTA
          </span>
        )}
      </a>

      <h3 className="mt-4 font-semibold">{name}</h3>
      {salePriceCL ? (
        <div className="flex items-baseline gap-2">
          <p className="text-base font-bold text-red-600">${salePriceCL}</p>
          <p className="text-sm text-slate-400 line-through">${priceCL}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-600">${priceCL}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={onBuy}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 flex-1"
        >
          Comprar
        </button>
        <FavoriteButton productId={id} />
      </div>
    </div>
  );
}
