interface InteriorStyleStepProps {
  value: string;
  onChange: (value: string) => void;
}

const styles = [
  {
    id: 'modern',
    label: 'Модерн',
    description: 'Чистые линии и функциональность',
    imageUrl: 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmlvciUyMGRlc2lnbiUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzc1MjY1MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'minimalism',
    label: 'Минимализм',
    description: 'Простота и лаконичность',
    imageUrl: 'figma:asset/225fc6d8eb514e7d381c1446ab997d59c445939a.png'
  },
  {
    id: 'scandinavian',
    label: 'Скандинавский',
    description: 'Светлые тона и уют',
    imageUrl: 'https://images.unsplash.com/photo-1724582586413-6b69e1c94a17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2FuZGluYXZpYW4lMjBpbnRlcmlvciUyMGRlc2lnbiUyMGNvenl8ZW58MXx8fHwxNzc1MjY1MDI1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'loft',
    label: 'Лофт',
    description: 'Индустриальный шик',
    imageUrl: 'figma:asset/9cb2c8a9022f8377553c9fde027c07163f23f4e9.png'
  },
  {
    id: 'neoclassic',
    label: 'Неоклассика',
    description: 'Элегантность и изящество',
    imageUrl: 'figma:asset/e12a2cdbd1704ffb4769117895e5264827f4bacc.png'
  },
  {
    id: 'classic',
    label: 'Классика',
    description: 'Традиции и роскошь',
    imageUrl: 'figma:asset/88ba377cbcee70aa4181da0e30f6a62ac4eccf7c.png'
  },
  {
    id: 'unsure',
    label: 'Не уверен',
    description: 'Поможем с выбором',
    imageUrl: 'https://images.unsplash.com/photo-1771218829804-3b51b295f359?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMGRlc2lnbiUyMGlkZWFzJTIwYmVhdXRpZnVsfGVufDF8fHx8MTc3NTI2NTAyNnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

export function InteriorStyleStep({ value, onChange }: InteriorStyleStepProps) {
  return (
    <div className="animate-fadeIn">
      <h2 className="mb-8 text-gray-800">Какой стиль интерьера вам ближе?</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map((style) => (
          <button
            key={style.id}
            data-crab-target={value === style.id ? 'true' : undefined}
            onClick={() => onChange(style.id)}
            className={`
              relative overflow-hidden rounded-xl border-2 transition-all duration-200 text-left
              hover:shadow-lg hover:scale-[1.02] group
              ${value === style.id
                ? 'border-amber-500 shadow-md'
                : 'border-gray-200 hover:border-amber-300'
              }
            `}
          >
            <div className="h-40 relative overflow-hidden">
              <img
                src={style.imageUrl}
                alt={style.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              {value === style.id && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-4 bg-white">
              <div className="mb-1 text-gray-800">{style.label}</div>
              <div className="text-sm text-muted-foreground">{style.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
