import { useState } from 'react';
import { PropertyTypeStep } from './components/PropertyTypeStep';
import { ProjectZonesStep } from './components/ProjectZonesStep';
import { AreaSizeStep } from './components/AreaSizeStep';
import { InteriorStyleStep } from './components/InteriorStyleStep';
import { BudgetStep } from './components/BudgetStep';
import { LeadFormStep } from './components/LeadFormStep';
import { SuccessStep } from './components/SuccessStep';
import { AnimatedCrab } from './components/AnimatedCrab';

export interface QuizData {
  propertyType: string;
  projectZones: string[];
  areaSize: number;
  interiorStyle: string;
  budget: string;
  name: string;
  phone: string;
  email: string;
  comment: string;
  privacyAgreed: boolean;
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    propertyType: '',
    projectZones: [],
    areaSize: 60,
    interiorStyle: '',
    budget: '',
    name: '',
    phone: '',
    email: '',
    comment: '',
    privacyAgreed: false,
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      setCurrentStep(7); // Success step
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateQuizData = (field: keyof QuizData, value: any) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const resetQuiz = () => {
    setCurrentStep(1);
    setQuizData({
      propertyType: '',
      projectZones: [],
      areaSize: 60,
      interiorStyle: '',
      budget: '',
      name: '',
      phone: '',
      email: '',
      comment: '',
      privacyAgreed: false,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return quizData.propertyType !== '';
      case 2:
        return quizData.projectZones.length > 0;
      case 3:
        return true; // Slider always has a value
      case 4:
        return quizData.interiorStyle !== '';
      case 5:
        return quizData.budget !== '';
      case 6:
        return quizData.name !== '' && quizData.phone !== '' && quizData.privacyAgreed;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        {currentStep <= totalSteps && (
          <div className="mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">Шаг {currentStep} из {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 transition-all duration-300">
          {currentStep === 1 && (
            <PropertyTypeStep
              value={quizData.propertyType}
              onChange={(value) => updateQuizData('propertyType', value)}
            />
          )}

          {currentStep === 2 && (
            <ProjectZonesStep
              value={quizData.projectZones}
              onChange={(value) => updateQuizData('projectZones', value)}
            />
          )}

          {currentStep === 3 && (
            <AreaSizeStep
              value={quizData.areaSize}
              onChange={(value) => updateQuizData('areaSize', value)}
            />
          )}

          {currentStep === 4 && (
            <InteriorStyleStep
              value={quizData.interiorStyle}
              onChange={(value) => updateQuizData('interiorStyle', value)}
            />
          )}

          {currentStep === 5 && (
            <BudgetStep
              value={quizData.budget}
              onChange={(value) => updateQuizData('budget', value)}
            />
          )}

          {currentStep === 6 && (
            <LeadFormStep
              data={quizData}
              onChange={updateQuizData}
            />
          )}

          {currentStep === 7 && (
            <SuccessStep onReset={resetQuiz} />
          )}

          {currentStep <= totalSteps && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
              >
                ← Назад
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {currentStep === totalSteps ? 'Получить консультацию' : 'Далее →'}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatedCrab currentStep={currentStep} />
    </div>
  );
}
