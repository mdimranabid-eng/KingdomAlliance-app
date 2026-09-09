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

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-[700px] px-2 mb-8">
      <div className="flex items-center gap-0">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 flex-shrink-0 relative">
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
                  "text-[9px] md:text-[10px] font-semibold tracking-[1px] uppercase whitespace-nowrap absolute -bottom-5 left-1/2 -translate-x-1/2",
                  isCompleted ? "text-[#b8860b]" : isActive ? "text-[#4a3521]" : "text-[#c4bba8]"
                )}>
                  {step.title}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-[2px] mx-1 mt-[-20px]">
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
        <div className="flex flex-col items-center gap-2 flex-shrink-0 ml-2">
          <div className="text-[#C9A84C] text-base leading-none opacity-60">✝</div>
        </div>
      </div>
    </div>
  );
}
