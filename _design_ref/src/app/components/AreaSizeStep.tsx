import { useState } from 'react';

interface AreaSizeStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function AreaSizeStep({ value, onChange }: AreaSizeStepProps) {
  const min = 20;
  const max = 300;
  const step = 5;

  return (
    <div className="animate-fadeIn">
      <h2 className="mb-8 text-gray-800">Укажите примерную площадь помещения</h2>

      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <div
            data-crab-target="true"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl shadow-sm relative"
          >
            <div className="text-5xl font-light text-gray-800">
              {value} <span className="text-3xl text-gray-600">м²</span>
            </div>
          </div>
        </div>

        <div className="relative px-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, rgb(217, 119, 6) 0%, rgb(245, 158, 11) ${((value - min) / (max - min)) * 100}%, rgb(229, 231, 235) ${((value - min) / (max - min)) * 100}%, rgb(229, 231, 235) 100%)`
            }}
          />

          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>{min} м²</span>
            <span>{max} м²</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[40, 60, 100, 150].map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`
                py-3 px-4 rounded-lg border-2 transition-all duration-200
                ${value === preset
                  ? 'border-amber-500 bg-amber-50 text-gray-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                }
              `}
            >
              {preset} м²
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, rgb(217, 119, 6), rgb(245, 158, 11));
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, rgb(217, 119, 6), rgb(245, 158, 11));
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }
      `}</style>
    </div>
  );
}
