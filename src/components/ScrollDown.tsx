import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScrollDownProps {
  toTop?: boolean;
  className?: string;
}

export default function ScrollDown({ toTop = false, className = '' }: ScrollDownProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toTop) {
      const snapContainer = document.querySelector('.snap-container');
      if (snapContainer) {
        snapContainer.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const currentSection = (e.currentTarget as HTMLElement).closest('section');
      if (currentSection) {
        let next = currentSection.nextElementSibling;
        while (next && next.tagName !== 'SECTION') {
          next = next.nextElementSibling;
        }
        if (next) {
          next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-1 ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
    >
      {toTop ? (
        <>
          <ChevronUp
            className="w-5 h-5 text-[#C4856A]"
            style={{ animation: 'bounceArrowUp 1.5s ease-in-out infinite' }}
          />
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#C4856A]">Top</span>
        </>
      ) : (
        <>
          <span className="text-[10px] tracking-[0.15em] uppercase text-white/70">Scroll</span>
          <ChevronDown
            className="w-5 h-5 text-white/70"
            style={{ animation: 'bounceArrow 1.5s ease-in-out infinite' }}
          />
        </>
      )}
    </div>
  );
}
