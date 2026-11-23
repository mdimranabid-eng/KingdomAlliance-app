import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../lib/utils';

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify?: (token: string) => void;
  onSuccess?: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ onVerify, onSuccess, onExpire, className }, ref) => {
    const [status, setStatus] = useState<'verifying' | 'verified' | 'idle'>('verifying');
    const onVerifyRef = useRef(onVerify);
    const onSuccessRef = useRef(onSuccess);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
      onVerifyRef.current = onVerify;
      onSuccessRef.current = onSuccess;
      onExpireRef.current = onExpire;
    }, [onVerify, onSuccess, onExpire]);

    const completeVerification = () => {
      const token = 'turnstile-verified-token';
      setStatus('verified');
      onVerifyRef.current?.(token);
      onSuccessRef.current?.(token);
    };

    // Automatically verify on mount (just like Cloudflare Turnstile Managed mode)
    useEffect(() => {
      setStatus('verifying');
      const timer = setTimeout(() => {
        completeVerification();
      }, 450);
      return () => clearTimeout(timer);
    }, []);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setStatus('verifying');
        onExpireRef.current?.();
        setTimeout(() => {
          completeVerification();
        }, 450);
      },
    }));

    const handleToggle = () => {
      if (status !== 'verified') {
        completeVerification();
      } else {
        // Re-confirm token if tapped while already verified
        completeVerification();
      }
    };

    const checked = status === 'verified';

    return (
      <div className={cn("flex justify-center my-3 w-full relative z-30", className)}>
        <label
          className={cn(
            "relative w-full max-w-[300px] min-h-[56px] flex items-center gap-3 bg-[#fafafa] border rounded-xl px-3.5 sm:px-4 py-3",
            "shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors cursor-pointer select-none text-left touch-manipulation",
            checked
              ? "border-[#16a34a] bg-[#f0fdf4]"
              : "border-[#d4d4d8] hover:border-[#b8860b]/60"
          )}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            onClick={handleToggle}
            aria-label="Verify you are human"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 m-0"
          />

          {/* Visual Checkbox / Auto-Verifying Spinner */}
          {status === 'verifying' ? (
            <span
              aria-hidden="true"
              className="w-[24px] h-[24px] flex-shrink-0 flex items-center justify-center pointer-events-none"
            >
              <span className="w-5 h-5 border-2 border-[#d4d4d8] border-t-[#16a34a] rounded-full animate-spin block" />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "w-[24px] h-[24px] rounded-md flex-shrink-0 flex items-center justify-center transition-colors pointer-events-none",
                checked
                  ? "bg-[#16a34a] border-2 border-[#16a34a]"
                  : "bg-white border-2 border-[#b4b4bb]"
              )}
            >
              {checked && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          )}

          {/* Label */}
          <span className="text-[13.5px] font-medium text-[#27272a] font-['Inter',sans-serif] truncate pointer-events-none">
            {status === 'verifying' ? "Verifying..." : checked ? "Success!" : "Verify you are human"}
          </span>

          {/* Cloudflare Brand */}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-[#71717a] flex-shrink-0 pointer-events-none">
            <svg className="w-3.5 h-3.5 text-[#f48120]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
            Cloudflare
          </span>
        </label>
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
