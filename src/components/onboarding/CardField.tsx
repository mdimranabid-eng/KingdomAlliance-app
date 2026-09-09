import React from 'react';
import { cn } from '../../lib/utils';

interface CardFieldProps {
  label: string;
  field: string;
  isOptional?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function CardField({ label, field, isOptional = false, error, children, className }: CardFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} id={`field-${field}`}>
      <label className="block text-[10px] font-bold tracking-[1.5px] uppercase text-[#b8860b]/80">
        {label}
        {!isOptional ? (
          <span className="text-[#dc2626] text-[11px] ml-[2px]">*</span>
        ) : (
          <span className="text-[#c4bba8] italic text-[10px] ml-[3px] normal-case tracking-normal font-normal">(Optional)</span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[#dc2626] text-[12px] font-inter mt-1">{error}</p>
      )}
    </div>
  );
}

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function FieldInput({ hasError, className, ...props }: FieldInputProps) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 bg-[#faf8f4] border-[1.5px] border-[#f0ead9] rounded-xl",
        "font-['Montserrat',sans-serif] text-[14px] text-[#4a3521]",
        "outline-none transition-all duration-200",
        "focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] focus:bg-white",
        "placeholder:text-[#9aa3af] placeholder:font-normal",
        "read-only:bg-[#f5f3ef] read-only:cursor-not-allowed read-only:text-[#64748b]",
        hasError && "border-[#dc2626] shadow-[0_0_0_3px_rgba(220,38,38,0.08)]",
        className
      )}
      {...props}
    />
  );
}

interface FieldSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FieldSelect({ hasError, options, placeholder, className, ...props }: FieldSelectProps) {
  return (
    <select
      className={cn(
        "w-full px-4 py-3 bg-[#faf8f4] border-[1.5px] border-[#f0ead9] rounded-xl",
        "font-['Montserrat',sans-serif] text-[14px] text-[#4a3521]",
        "outline-none transition-all duration-200 cursor-pointer",
        "focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] focus:bg-white",
        "appearance-none",
        "bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23a89f8d%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]",
        "pr-10",
        hasError && "border-[#dc2626] shadow-[0_0_0_3px_rgba(220,38,38,0.08)]",
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

interface FieldTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function FieldTextarea({ hasError, className, ...props }: FieldTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 bg-[#faf8f4] border-[1.5px] border-[#f0ead9] rounded-xl",
        "font-['Montserrat',sans-serif] text-[14px] text-[#4a3521]",
        "outline-none transition-all duration-200 resize-none min-h-[80px] leading-relaxed",
        "focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] focus:bg-white",
        "placeholder:text-[#9aa3af] placeholder:font-normal",
        hasError && "border-[#dc2626] shadow-[0_0_0_3px_rgba(220,38,38,0.08)]",
        className
      )}
      {...props}
    />
  );
}
