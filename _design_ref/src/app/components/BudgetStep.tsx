interface BudgetStepProps {
  value: string;
  onChange: (value: string) => void;
}

const budgetOptions = [
  { id: 'up-to-500k', label: 'До 500 тыс. ₽', icon: '💰' },
  { id: '500k-1m', label: '500 тыс. - 1 млн ₽', icon: '💎' },
  { id: '1m-2m', label: '1 - 2 млн ₽', icon: '💍' },
  { id: 'over-2m', label: 'Свыше 2 млн ₽', icon: '👑' },
  { id: 'unsure', label: 'Не определился', icon: '🤔' },
];

export function BudgetStep({ value, onChange }: BudgetStepProps) {
  return (
    <div className="animate-fadeIn">
      <h2 className="mb-8 text-gray-800">Какой бюджет на реализацию интерьера вы рассматриваете?</h2>

      <div className="max-w-2xl mx-auto space-y-3">
        {budgetOptions.map((option) => (
          <button
            key={option.id}
            data-crab-target={value === option.id ? 'true' : undefined}
            onClick={() => onChange(option.id)}
            className={`
              relative w-full p-5 rounded-xl border-2 transition-all duration-200 text-left
              flex items-center gap-4 hover:shadow-md
              ${value === option.id
                ? 'border-amber-500 bg-amber-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-amber-300'
              }
            `}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
              <span className="text-2xl">{option.icon}</span>
            </div>

            <div className="flex-1">
              <div className="text-gray-800">{option.label}</div>
            </div>

            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${value === option.id
                ? 'border-amber-500 bg-amber-500'
                : 'border-gray-300'
              }
            `}>
              {value === option.id && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
