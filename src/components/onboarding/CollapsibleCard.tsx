import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  iconColor?: 'gold' | 'apricot' | 'ink' | 'green';
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

const iconColors = {
  gold: 'bg-[rgba(201,168,76,0.1)] text-[#b8860b]',
  apricot: 'bg-[rgba(179,128,76,0.1)] text-[#8f6337]',
  ink: 'bg-[rgba(74,53,33,0.08)] text-[#4a3521]',
  green: 'bg-[rgba(22,163,74,0.08)] text-[#16a34a]',
};

export default function CollapsibleCard({
  title,
  icon,
  iconColor = 'gold',
  defaultOpen = true,
  badge,
  children,
  className
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "border border-[#f0ead9] rounded-[20px] bg-white overflow-hidden transition-all duration-200",
      isOpen ? "shadow-[0_4px_16px_rgba(74,53,33,0.08)]" : "hover:shadow-[0_1px_3px_rgba(74,53,33,0.06)]",
      "hover:border-[#e2d5be]",
      className
    )}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors hover:bg-[#fdfcfa]"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0",
            iconColors[iconColor]
          )}>
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['Playfair_Display',serif] text-[15px] font-semibold text-[#4a3521]">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-semibold text-[#b8860b] bg-[rgba(201,168,76,0.1)] px-2 py-0.5 rounded-[10px]">
                {badge}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-[#a89f8d] transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
