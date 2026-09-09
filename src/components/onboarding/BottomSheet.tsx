import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomSheetOption {
  value: string;
  label: string;
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: BottomSheetOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  multiple?: boolean;
  selectedValues?: string[];
  onToggleMultiple?: (value: string) => void;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  multiple = false,
  selectedValues = [],
  onToggleMultiple
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelect = (value: string) => {
    if (multiple && onToggleMultiple) {
      onToggleMultiple(value);
    } else {
      onSelect(value);
      onClose();
    }
  };

  const isSelected = (value: string) => {
    if (multiple) {
      return selectedValues.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] flex items-end justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[500px] bg-white rounded-t-[20px] max-h-[70vh] flex flex-col"
          >
            {/* Handle */}
            <div className="w-9 h-[4px] bg-[#d4d0c8] rounded-full mx-auto mt-2.5" />

            {/* Header */}
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex justify-between items-center">
              <h3 className="font-['Playfair_Display',serif] text-[17px] font-semibold text-[#4a3521]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full border-none bg-[#f1f1f1] cursor-pointer flex items-center justify-center text-[#64748b] hover:bg-[#e5e5e5] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Options */}
            <div className="flex-1 overflow-y-auto py-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-5 py-3.5 flex items-center gap-3 cursor-pointer transition-colors text-left",
                    "font-['Montserrat',sans-serif] text-[14px]",
                    isSelected(option.value)
                      ? "bg-[rgba(201,168,76,0.06)] text-[#b8860b] font-semibold"
                      : "bg-white text-[#4a3521] hover:bg-[#faf8f4]"
                  )}
                >
                  <div className={cn(
                    "w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                    isSelected(option.value)
                      ? "border-[#C9A84C]"
                      : "border-[#e2e8f0]"
                  )}>
                    {isSelected(option.value) && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#C9A84C]" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            {multiple && (
              <div className="px-5 py-3 border-t border-[#e2e8f0]">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#4a3521] text-white border-none rounded-[14px] font-['Montserrat',sans-serif] text-[14px] font-semibold cursor-pointer hover:bg-[#3a2a1a] transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MobileSelectTriggerProps {
  value?: string;
  placeholder: string;
  onClick: () => void;
  hasError?: boolean;
}

export function MobileSelectTrigger({ value, placeholder, onClick, hasError }: MobileSelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "md:hidden w-full px-4 py-3 bg-[#faf8f4] border-[1.5px] rounded-xl",
        "font-['Montserrat',sans-serif] text-[14px] text-left",
        "flex justify-between items-center transition-all",
        "active:border-[#C9A84C]",
        hasError ? "border-[#dc2626]" : "border-[#f0ead9]",
        value ? "text-[#4a3521]" : "text-[#9aa3af]"
      )}
    >
      <span className="truncate">{value || placeholder}</span>
      <svg className="w-4 h-4 text-[#a89f8d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
