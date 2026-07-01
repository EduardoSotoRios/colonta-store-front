type Props = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  href?: string;
  onBuy?: () => void;
};

export default function ProductCard({ id, name, price, imageUrl, href = "#", onBuy }: Props) {
  const priceCL = new Intl.NumberFormat("es-CL").format(price);
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 flex flex-col">
      <a href={href} className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 block">
        <img className="w-full h-full object-cover" src={imageUrl} alt={name} />
      </a>

      <h3 className="mt-4 font-semibold">{name}</h3>
      <p className="text-sm text-slate-600">${priceCL}</p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onBuy}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-white bg-colonta-primary hover:opacity-90 flex-1"
        >
          Comprar
        </button>
        <button
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold border hover:bg-slate-50"
          aria-label="Añadir a favoritos"
        >
          ❤
        </button>
      </div>
    </div>
  );
}