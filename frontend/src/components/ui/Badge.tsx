import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'outline';
  size?: 'xs' | 'sm';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className
}) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-surface-raised text-text-secondary border-border/50',
    accent:  'bg-accent/10 text-accent border-accent/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger:  'bg-danger/10 text-danger border-danger/20',
    outline: 'bg-transparent text-text-muted border-border/50',
  };

  const sizeClasses: Record<string, string> = {
    xs: 'px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
    sm: 'px-2 py-0.5 text-xs font-medium',
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-badge border transition-colors",
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
};
