interface PropertyTypeStepProps {
  value: string;
  onChange: (value: string) => void;
}

const propertyTypes = [
  { id: 'apartment', label: 'Квартира', icon: '🏢' },
  { id: 'house', label: 'Частный дом', icon: '🏡' },
  { id: 'office', label: 'Офис', icon: '🏛️' },
  { id: 'commercial', label: 'Коммерция', icon: '🏪' },
  { id: 'studio', label: 'Студия', icon: '🎨' },
  { id: 'other', label: 'Другое', icon: '📐' },
];

export function PropertyTypeStep({ value, onChange }: PropertyTypeStepProps) {
  return (
    <div className="animate-fadeIn">
      <h2 className="mb-8 text-gray-800">Какое помещение вы планируете оформить?</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {propertyTypes.map((type) => (
          <button
            key={type.id}
            data-crab-target={value === type.id ? 'true' : undefined}
            onClick={() => onChange(type.id)}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-200 text-left
              hover:shadow-lg hover:scale-[1.02]
              ${value === type.id
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-amber-300'
              }
            `}
          >
            <div className="mb-3">
              <span className="text-4xl">{type.icon}</span>
            </div>
            <div className="text-gray-800">{type.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
