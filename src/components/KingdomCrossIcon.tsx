import React from 'react';

interface KingdomCrossIconProps {
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
}

export const KingdomCrossIcon = ({ size = 'md', className = '' }: KingdomCrossIconProps) => {
  const sizeMap = {
    sm: 20,
    md: 32,
    lg: 48
  };

  const dimension = typeof size === 'number' ? size : sizeMap[size];

  return (
    <svg 
      width={dimension} 
      height={dimension} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.4))' }}
    >
      <defs>
        <linearGradient id="crossGoldGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
          <stop offset="50%" style={{ stopColor: '#FFF0A0', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      
      {/* Main Cross Shape */}
      <path 
        d="M10 2H14V8H20V12H14V22H10V12H4V8H10V2Z" 
        fill="url(#crossGoldGradient)" 
      />
      
      {/* Subtle 3D Highlight Strip */}
      <rect 
        x="11.5" 
        y="2" 
        width="1" 
        height="20" 
        fill="url(#highlightGradient)" 
      />
      <rect 
        x="4" 
        y="9.5" 
        width="16" 
        height="1" 
        fill="url(#highlightGradient)" 
      />
    </svg>
  );
};
