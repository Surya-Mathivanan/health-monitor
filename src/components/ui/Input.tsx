import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, leftIcon, rightIcon, hint, className, id, ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{leftIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'form-input',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{rightIcon}</span>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, options, placeholder, className, id, ...props
}, ref) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="form-label">{label}</label>}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'form-input appearance-none',
          error && 'border-red-500/60 focus:ring-red-500/40',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, error, className, id, ...props
}, ref) => {
  const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={taId} className="form-label">{label}</label>}
      <textarea
        ref={ref}
        id={taId}
        className={cn(
          'form-input resize-none',
          error && 'border-red-500/60 focus:ring-red-500/40',
          className
        )}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';
