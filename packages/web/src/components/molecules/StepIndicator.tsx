'use client';

import { Check } from 'lucide-react';
import type { WizardStep } from '@/hooks/use-new-project-wizard';

const STEPS = [
  { step: 1 as WizardStep, label: 'Tipo de Input' },
  { step: 2 as WizardStep, label: 'Detalhes' },
  { step: 3 as WizardStep, label: 'Estilo' },
  { step: 4 as WizardStep, label: 'Croqui' },
  { step: 5 as WizardStep, label: 'Geracao' },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progresso do wizard" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map(({ step, label }, index) => {
          const isActive = step === currentStep;
          const isComplete = step < currentStep;
          const isPending = step > currentStep;

          return (
            <li key={step} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => isComplete && onStepClick?.(step)}
                disabled={!isComplete}
                className={`flex flex-col items-center gap-1.5 ${
                  isComplete ? 'cursor-pointer' : 'cursor-default'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isComplete
                      ? 'bg-brand-600 text-white'
                      : isActive
                        ? 'border-2 border-brand-600 bg-white text-brand-600'
                        : 'border-2 border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isActive
                      ? 'text-brand-600'
                      : isComplete
                        ? 'text-gray-700'
                        : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 hidden h-0.5 flex-1 sm:block ${
                    step < currentStep ? 'bg-brand-600' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
