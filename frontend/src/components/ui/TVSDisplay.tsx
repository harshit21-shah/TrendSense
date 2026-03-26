import React from 'react';
import { cn } from '../../utils/cn';

interface TVSDisplayProps {
  score: number;
  delta?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TVSDisplay: React.FC<TVSDisplayProps> = ({ 
  score, 
  delta, 
  size = 'md', 
  className 
}) => {
  const isPositive = delta && delta > 0;
  const isNegative = delta && delta < 0;

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-5xl', // Increased from 4xl
    lg: 'text-7xl', // Increased from 6xl
  };

  const deltaSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-base', // Slightly larger
    lg: 'text-xl',
  };

  return (
    <div className={cn("flex flex-col items-end leading-[0.85] font-mono", className)}>
      <div className={cn("font-bold text-text-primary tracking-tighter", sizeClasses[size])}>
        {score.toFixed(0)}
      </div>
      {delta !== undefined && (
        <div className={cn(
          "flex items-center gap-1 mt-1.5 font-bold",
          deltaSizeClasses[size],
          isPositive ? "text-success" : isNegative ? "text-danger" : "text-text-muted"
        )}>
          <span>{isPositive ? '+' : ''}{delta.toFixed(1)}</span>
          {isPositive && <span className="text-[0.7em] translate-y-[-1px]">↑</span>}
          {isNegative && <span className="text-[0.7em] translate-y-[1px]">↓</span>}
        </div>
      )}
    </div>
  );
};
