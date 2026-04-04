import { useState } from 'react';

interface ProjectZonesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const zones = [
  { id: 'kitchen', label: 'Кухня', icon: '🍳' },
  { id: 'living', label: 'Гостиная', icon: '🛋️' },
  { id: 'bedroom', label: 'Спальня', icon: '🛏️' },
  { id: 'nursery', label: 'Детская', icon: '🧸' },
  { id: 'bathroom', label: 'Санузел', icon: '🚿' },
  { id: 'hallway', label: 'Прихожая', icon: '🚪' },
  { id: 'office', label: 'Кабинет', icon: '💼' },
  { id: 'wardrobe', label: 'Гардероб', icon: '👔' },
  { id: 'balcony', label: 'Балкон', icon: '🌿' },
  { id: 'full', label: 'Всё помещение', icon: '🏠' },
];

export function ProjectZonesStep({ value, onChange }: ProjectZonesStepProps) {
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  const toggleZone = (zoneId: string) => {
    if (value.includes(zoneId)) {
      onChange(value.filter(id => id !== zoneId));
      setLastSelected(null);
    } else {
      onChange([...value, zoneId]);
      setLastSelected(zoneId);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="mb-4 text-gray-800">Какие зоны нужно включить в дизайн-проект?</h2>
      <p className="mb-8 text-muted-foreground">Можно выбрать несколько вариантов</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {zones.map((zone, index) => (
          <button
            key={zone.id}
            data-crab-target={value.includes(zone.id) && zone.id === lastSelected ? 'true' : undefined}
            onClick={() => toggleZone(zone.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              hover:shadow-md hover:scale-[1.02]
              ${value.includes(zone.id)
                ? 'border-amber-500 bg-amber-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-amber-300'
              }
            `}
          >
            <div className="mb-2">
              <span className="text-3xl">{zone.icon}</span>
            </div>
            <div className="text-sm text-gray-800">{zone.label}</div>

            {value.includes(zone.id) && (
              <div className="mt-2">
                <div className="w-5 h-5 mx-auto bg-amber-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
