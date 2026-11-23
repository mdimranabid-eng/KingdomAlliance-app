import React from 'react';
import { cn } from '../../lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const SHORT_TITLES: Record<number, string> = {
  1: 'Basic',
  2: 'Personal',
  3: 'Family',
  4: 'Partner',
  5: 'Photos',
};

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding Progress" className="w-full max-w-[700px] px-2 sm:px-4 mb-6 sm:mb-8">
      <div className="flex items-start justify-between gap-1">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div
                aria-current={isActive ? 'step' : undefined}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[44px] sm:min-w-[64px]"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-500",
                  isCompleted
                    ? "bg-[#C9A84C] text-white shadow-[0_2px_12px_rgba(201,168,76,0.35)]"
                    : isActive
                      ? "bg-[#4a3521] text-white shadow-[0_2px_16px_rgba(74,53,33,0.3)]"
                      : "bg-[#f0ead9] text-[#a89f8d] border border-[#e2ddd2]"
                )}>
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.id}
                </div>
                <span className={cn(
                  "text-[9px] sm:text-[10px] font-semibold tracking-[0.5px] sm:tracking-[0.8px] uppercase text-center leading-tight",
                  isCompleted ? "text-[#b8860b]" : isActive ? "text-[#4a3521] font-bold" : "text-[#c4bba8]"
                )}>
                  <span className="md:hidden">{SHORT_TITLES[step.id] || step.title}</span>
                  <span className="hidden md:inline whitespace-nowrap">{step.title}</span>
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-[2px] mx-0.5 sm:mx-1.5 mt-4">
                  <div className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isCompleted
                      ? "bg-gradient-to-r from-[#C9A84C] to-[#C9A84C]"
                      : isActive
                        ? "bg-gradient-to-r from-[#C9A84C] to-[#e5dfcf]"
                        : "bg-[#e5dfcf]"
                  )} />
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0 ml-2 mt-1.5">
          <div className="text-[#C9A84C] text-base leading-none opacity-60">✝</div>
        </div>
      </div>
    </nav>
  );
}
