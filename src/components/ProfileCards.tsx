import React from 'react';
import { cn } from '../lib/utils';

/**
 * Sanctuary profile card system.
 *
 * Shared shells for the member profile: a warm white panel, hairline gilt-tinted
 * borders, tracked micro-caps labels closed by a rule, and ivory ledger chips for
 * recorded values. Kept separate from ProfilePage so every profile surface — and
 * preview tooling — draws from the same vocabulary.
 */

export type DetailItem = {
  label: string;
  value?: string | number | null;
  icon: React.ElementType;
  wide?: boolean;
  /** Tighter chip — for narrow sidebar columns and 3-up grids. */
  dense?: boolean;
  className?: string;
};

/** True when a stored profile value is worth rendering. */
export const hasValue = (v: any) =>
  v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim().toLowerCase() !== 'n/a';

/**
 * ProfileSection — the card shell: icon tile + tracked micro-caps label closed by a
 * hairline rule, with an optional single action on the right.
 * `compact` trims the padding and header rhythm for dense, glanceable record cards.
 */
export function ProfileSection({
  id,
  icon: Icon,
  title,
  action,
  children,
  className,
  compact = false,
}: {
  id?: string;
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        compact
          ? 'rounded-[16px] border border-[#eee5d2] bg-white p-3.5 sm:rounded-[20px] sm:p-4 lg:p-5'
          : 'rounded-[18px] border border-[#eee5d2] bg-white p-4 sm:rounded-[22px] sm:p-6 lg:p-8',
        'shadow-[0_18px_44px_-30px_rgba(74,53,33,0.28)] transition-shadow duration-300 hover:shadow-[0_26px_56px_-30px_rgba(74,53,33,0.34)]',
        className
      )}
    >
      <header className={cn('flex items-center gap-2.5', compact ? 'mb-2.5 sm:mb-3.5' : 'mb-4 sm:mb-6')}>
        <span aria-hidden className={cn(
          'grid place-items-center rounded-[8px] bg-[#faf4ea] border border-[#f0e5cc] text-[#b8860b] shrink-0',
          compact ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-7 sm:h-7 sm:rounded-[9px]'
        )}>
          <Icon className={compact ? 'w-2.5 h-2.5 sm:w-3 sm:h-3' : 'w-3 h-3 sm:w-3.5 sm:h-3.5'} />
        </span>
        <h2 className="text-[9.5px] font-bold uppercase tracking-[1.6px] text-[#b8860b] whitespace-nowrap sm:text-[10.5px] sm:tracking-[2.2px]">{title}</h2>
        <span aria-hidden className="h-px flex-1 bg-[#f0ead9]" />
        {action}
      </header>
      {children}
    </section>
  );
}

/** Detail — one recorded field: micro-caps label over its value, in an ivory ledger chip. */
export function Detail({ label, value, icon: Icon, wide = false, dense = false, className }: DetailItem) {
  if (!hasValue(value)) return null;
  const isText = wide && typeof value === 'string' && value.length > 60;
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[12px] border border-[#f0ead9] bg-[#fdfaf3] px-2.5 py-2 transition-colors duration-200 hover:border-[#e3d5b8] hover:bg-[#faf4ea] focus-within:border-[#C9A84C] sm:rounded-[14px] sm:px-4 sm:py-3',
        dense && 'rounded-[10px] px-2 py-1.5 sm:rounded-[12px] sm:px-2.5 sm:py-2',
        wide && 'col-span-full',
        className
      )}
    >
      <span
        aria-hidden
        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-[#dfc88a] to-[#C9A84C] opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:top-2.5 sm:bottom-2.5"
      />
      <span className={cn(
        'flex items-center gap-1 text-[8.5px] font-bold uppercase leading-tight tracking-[0.8px] text-[#a89f8d] sm:gap-1.5 sm:text-[9.5px] sm:tracking-[1.5px]',
        dense && 'text-[8px] sm:text-[8.5px] sm:tracking-[1px]'
      )}>
        <Icon aria-hidden className={cn('shrink-0 text-[#c8b48a] w-2.5 h-2.5 sm:w-3 sm:h-3', dense && 'sm:w-2.5 sm:h-2.5')} />
        {label}
      </span>
      <span
        className={cn(
          'mt-0.5 block text-[12px] leading-snug text-[#4a3521] break-words sm:mt-1 sm:text-[13.5px]',
          dense && 'sm:text-[12.5px]',
          isText ? 'font-medium leading-[1.7] sm:leading-[1.75] whitespace-pre-wrap' : 'font-semibold'
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** PillGroup — lists (languages, hobbies, ministries) as gold tokens, not cramped chips. */
export function PillGroup({ icon: Icon, label, items, dense = false }: { icon: React.ElementType; label: string; items: string[]; dense?: boolean }) {
  return (
    <div>
      <span className={cn(
        'flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.8px] text-[#a89f8d] sm:text-[9.5px] sm:tracking-[1.5px]',
        dense && 'text-[8px] sm:text-[8.5px] sm:tracking-[1px]'
      )}>
        <Icon aria-hidden className={cn('text-[#c8b48a] w-2.5 h-2.5 sm:w-3 sm:h-3', dense && 'w-2.5 h-2.5')} />
        {label}
      </span>
      <div className={cn('mt-2 flex flex-wrap gap-1.5 sm:mt-2.5 sm:gap-2', dense && 'mt-1.5 gap-1 sm:mt-2 sm:gap-1.5')}>
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              'rounded-full border border-[#f0e5cc] bg-[#fdfaf3] px-2.5 py-1 text-[10.5px] font-bold text-[#8f6337] transition-colors hover:border-[#e3d5b8] hover:bg-[#faf4ea] sm:px-3 sm:py-1.5 sm:text-[11.5px]',
              dense && 'px-2 py-0.5 text-[9.5px] sm:px-2.5 sm:py-1 sm:text-[10.5px]'
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
