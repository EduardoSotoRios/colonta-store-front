import Link from 'next/link';

interface SuccessScreenProps {
  onRestart: () => void;
}

export default function SuccessScreen({ onRestart }: SuccessScreenProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Tu diseño se agregó al carrito!</h2>
      <p className="text-gray-500 text-sm mb-8">
        Ya puedes seguir con tu compra como con cualquier otro producto: revisa tu carrito, ingresa tu dirección y paga.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/cart"
          className="px-8 py-3 bg-[#5B2D8E] hover:bg-[#4a2275] text-white font-semibold rounded-2xl transition-colors text-sm"
        >
          Ver carrito →
        </Link>
        <button
          onClick={onRestart}
          className="px-8 py-3 text-gray-500 hover:text-gray-700 font-semibold rounded-2xl transition-colors text-sm"
        >
          Diseñar otro producto
        </button>
      </div>
    </div>
  );
}
