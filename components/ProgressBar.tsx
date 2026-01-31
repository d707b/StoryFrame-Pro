import React from 'react';
import { AppStep } from '../types';

interface ProgressBarProps {
  currentStep: AppStep;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { step: AppStep.PANEL_COUNT, label: 'العدد' },
    { step: AppStep.STORY_INPUT, label: 'القصة' },
    { step: AppStep.STYLE_SELECTION, label: 'الستايل' },
    { step: AppStep.RESULT, label: 'النتيجة' },
  ];

  // Calculate progress percentage (1 to 4 mapped to 0% to 100%)
  const totalSteps = steps.length;
  // If we are at generating (step 4), show full bar up to style. Result is step 5.
  const activeIndex = currentStep >= AppStep.RESULT ? 4 : Math.max(0, currentStep - 1); 
  const progressPercent = Math.min(100, (activeIndex / (totalSteps - 1)) * 100);

  if (currentStep === AppStep.WELCOME) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 rounded-full -translate-y-1/2"></div>
        
        {/* Active Line */}
        <div 
          className="absolute top-1/2 right-0 h-1 bg-white rounded-full -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between w-full">
          {steps.map((s, idx) => {
            const isActive = currentStep >= s.step;
            const isCurrent = currentStep === s.step;
            
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                    ${isActive ? 'bg-white text-purple-600 border-white' : 'bg-transparent text-white/50 border-white/30'}
                    ${isCurrent ? 'scale-110 shadow-lg shadow-purple-500/50' : ''}
                  `}
                >
                  {idx + 1}
                </div>
                <span className={`text-xs ${isActive ? 'text-white font-medium' : 'text-white/50'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
