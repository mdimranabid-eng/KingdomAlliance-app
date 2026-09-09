import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  className?: string;
}

export default function TurnstileWidget({ onVerify, className }: TurnstileWidgetProps) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  const handleClick = () => {
    if (status !== 'idle') return;

    setStatus('verifying');

    // Simulate verification (in production, this is handled by Turnstile widget)
    setTimeout(() => {
      setStatus('verified');
      onVerify('mock-turnstile-token');
    }, 1500);
  };

  return (
    <div className={cn("flex justify-center my-5", className)}>
      <div className={cn(
        "inline-flex items-center gap-3 bg-[#fafafa] border rounded-lg px-4 py-3 min-w-[300px]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors",
        status === 'verified' ? "border-[#16a34a] bg-[#f0fdf4]" : "border-[#e0e0e0]"
      )}>
        {/* Checkbox / Status */}
        {status === 'idle' && (
          <button
            type="button"
            onClick={handleClick}
            className="w-[22px] h-[22px] border-2 border-[#c1c1c1] rounded flex-shrink-0 flex items-center justify-center cursor-pointer transition-all hover:border-[#999] bg-white"
          />
        )}
        {status === 'verifying' && (
          <div className="w-[22px] h-[22px] flex-shrink-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#e0e0e0] border-t-[#2563eb] rounded-full animate-spin" />
          </div>
        )}
        {status === 'verified' && (
          <div className="w-[22px] h-[22px] bg-[#16a34a] rounded flex-shrink-0 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Label */}
        <span className="text-[13px] text-[#333] font-['Inter',sans-serif]">
          {status === 'idle' && "I'm not a robot"}
          {status === 'verifying' && "Verifying..."}
          {status === 'verified' && "Verified"}
        </span>

        {/* Cloudflare Brand */}
        <div className="ml-auto flex items-center gap-1 text-[10px] text-[#999] flex-shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          Cloudflare
        </div>
      </div>
    </div>
  );
}
