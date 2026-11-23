import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  className?: string;
}

export default function TurnstileWidget({ onVerify, className }: TurnstileWidgetProps) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  const handleClick = () => {
    if (status === 'verifying') return;
    if (status === 'verified') {
      onVerify('mock-turnstile-token');
      return;
    }

    setStatus('verifying');

    setTimeout(() => {
      setStatus('verified');
      onVerify('mock-turnstile-token');
    }, 600);
  };

  return (
    <div className={cn("flex justify-center my-5 w-full", className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={status === 'verified'}
        aria-label="Verify you are human"
        className={cn(
          "w-full max-w-[300px] min-h-[54px] flex items-center gap-3 bg-[#fafafa] border rounded-xl px-3.5 sm:px-4 py-3",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all cursor-pointer select-none text-left touch-manipulation active:scale-[0.99]",
          status === 'verified' ? "border-[#16a34a] bg-[#f0fdf4]" : "border-[#e0e0e0] hover:border-[#b8860b]/50"
        )}
      >
        {/* Checkbox / Status */}
        {status === 'idle' && (
          <span
            aria-hidden="true"
            className="w-[24px] h-[24px] border-2 border-[#c1c1c1] rounded-md flex-shrink-0 flex items-center justify-center transition-all bg-white"
          />
        )}
        {status === 'verifying' && (
          <span className="w-[24px] h-[24px] flex-shrink-0 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-[#e0e0e0] border-t-[#2563eb] rounded-full animate-spin block" />
          </span>
        )}
        {status === 'verified' && (
          <span className="w-[24px] h-[24px] bg-[#16a34a] rounded-md flex-shrink-0 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}

        {/* Label */}
        <span className="text-[13px] font-medium text-[#333] font-['Inter',sans-serif] truncate">
          {status === 'idle' && "Verify you are human"}
          {status === 'verifying' && "Verifying..."}
          {status === 'verified' && "Verified"}
        </span>

        {/* Cloudflare Brand */}
        <span className="ml-auto flex items-center gap-1 text-[10px] text-[#999] flex-shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          Cloudflare
        </span>
      </button>
    </div>
  );
}
