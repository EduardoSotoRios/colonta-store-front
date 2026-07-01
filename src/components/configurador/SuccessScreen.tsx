interface SuccessScreenProps {
  onRestart: () => void;
}

export default function SuccessScreen({ onRestart }: SuccessScreenProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Diseño descargado!</h2>
      <p className="text-gray-500 text-sm mb-2">
        La imagen de tu diseño se descargó en tu computador.{' '}
        <strong>Adjúntala al correo que se abrió</strong> para enviárnosla.
      </p>
      <p className="text-gray-400 text-sm mb-1">
        Nuestro equipo revisará tu diseño y te contactará al correo proporcionado para confirmar el pedido y darte el presupuesto.
      </p>
      <p className="text-gray-400 text-sm mb-8">
        Tiempo de respuesta estimado: <strong>24–48 horas hábiles</strong>
      </p>
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-[#5B2D8E] hover:bg-[#4a2275] text-white font-semibold rounded-2xl transition-colors text-sm"
      >
        Diseñar otro producto →
      </button>
    </div>
  );
}
