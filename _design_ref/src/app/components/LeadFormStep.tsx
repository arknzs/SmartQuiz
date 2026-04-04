import { QuizData } from '../App';

interface LeadFormStepProps {
  data: QuizData;
  onChange: (field: keyof QuizData, value: any) => void;
}

export function LeadFormStep({ data, onChange }: LeadFormStepProps) {
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length === 0) return '';
    if (limited.length <= 1) return `+7 ${limited}`;
    if (limited.length <= 4) return `+7 (${limited.slice(1)}`;
    if (limited.length <= 7) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4)}`;
    if (limited.length <= 9) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;
    return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange('phone', formatted);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="mb-3 text-gray-800">Оставьте контакты</h2>
      <p className="mb-8 text-muted-foreground">И мы свяжемся с вами по вашему проекту</p>

      <div className="max-w-xl mx-auto space-y-5">
        <div>
          <label className="block mb-2 text-gray-700">
            Ваше имя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Иван Иванов"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors bg-white"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            Телефон <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors bg-white"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-700">E-mail</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="example@mail.com"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors bg-white"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-700">Комментарий</label>
          <textarea
            value={data.comment}
            onChange={(e) => onChange('comment', e.target.value)}
            placeholder="Расскажите подробнее о вашем проекте..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors resize-none bg-white"
          />
        </div>

        <div className="pt-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={data.privacyAgreed}
                onChange={(e) => onChange('privacyAgreed', e.target.checked)}
                className="w-5 h-5 border-2 border-gray-300 rounded appearance-none cursor-pointer checked:bg-amber-500 checked:border-amber-500 transition-all"
              />
              {data.privacyAgreed && (
                <svg
                  className="absolute w-3 h-3 text-white pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              Я согласен с{' '}
              <a href="#" className="text-amber-600 hover:text-amber-700 underline">
                политикой конфиденциальности
              </a>{' '}
              <span className="text-red-500">*</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
