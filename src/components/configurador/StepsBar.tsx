interface StepsBarProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { label: 'Elige producto' },
  { label: 'Diseña' },
  { label: 'Envía' },
  { label: 'Listo' },
];

export default function StepsBar({ currentStep }: StepsBarProps) {
  return (
    <div className="flex justify-center items-center gap-0 px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto">
      {STEPS.map((step, i) => {
        const num = i + 1;
        const isDone   = num < currentStep;
        const isActive = num === currentStep;
        return (
          <div key={num} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap
              ${isActive ? 'text-[#5B2D8E]' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${isActive ? 'bg-[#5B2D8E] text-white' : isDone ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {isDone ? '✓' : num}
              </span>
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <span className="text-gray-300 text-lg select-none">›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
