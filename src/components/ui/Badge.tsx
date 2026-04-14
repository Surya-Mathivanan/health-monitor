import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'silver';
}

const variantClasses: Record<string, string> = {
  default: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  danger:  'text-red-400 bg-red-400/10 border-red-400/20',
  info:    'text-sky-400 bg-sky-400/10 border-sky-400/20',
  gold:    'text-gold-500 bg-gold-500/10 border-gold-500/20',
  silver:  'text-silver-400 bg-silver-400/10 border-silver-400/20',
};

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn('status-badge', variantClasses[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
