import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'brand-gradient-bg text-white shadow-brand hover:shadow-brand-lg hover:opacity-90 active:scale-[0.98]',
  secondary: 'bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 hover:border-sky-500/50',
  outline: 'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-800/50',
  ghost: 'text-slate-400 hover:text-white hover:bg-slate-800/50',
  danger: 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/50',
  gold: 'bg-gold-gradient text-slate-900 font-semibold shadow-gold hover:opacity-90 active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  icon: 'p-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, leftIcon, rightIcon, className, children, disabled, ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
      'disabled:opacity-50 disabled:pointer-events-none',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    {...props}
  >
    {loading ? (
      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
    ) : leftIcon}
    {children}
    {!loading && rightIcon}
  </button>
));
Button.displayName = 'Button';
