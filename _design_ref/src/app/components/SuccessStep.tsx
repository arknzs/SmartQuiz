interface SuccessStepProps {
  onReset: () => void;
}

export function SuccessStep({ onReset }: SuccessStepProps) {
  return (
    <div className="animate-fadeIn text-center py-8">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="mb-4 text-gray-800">Спасибо!</h2>
      <p className="mb-2 text-lg text-gray-700">Ваша заявка отправлена</p>
      <p className="mb-8 text-muted-foreground max-w-md mx-auto">
        Мы свяжемся с вами в ближайшее время для обсуждения вашего проекта
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Заполнить ещё одну заявку
        </button>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <p className="text-sm text-gray-700 mb-3">
          А пока вы можете:
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
          <a
            href="#"
            className="text-amber-600 hover:text-amber-700 transition-colors underline"
          >
            Посмотреть наше портфолио
          </a>
          <span className="hidden sm:inline text-gray-300">|</span>
          <a
            href="#"
            className="text-amber-600 hover:text-amber-700 transition-colors underline"
          >
            Узнать больше об услугах
          </a>
          <span className="hidden sm:inline text-gray-300">|</span>
          <a
            href="#"
            className="text-amber-600 hover:text-amber-700 transition-colors underline"
          >
            Читать блог о дизайне
          </a>
        </div>
      </div>
    </div>
  );
}
