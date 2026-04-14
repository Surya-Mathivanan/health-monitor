import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  bottomSheet?: boolean; // mobile full-screen bottom sheet
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export function Modal({ open, onClose, title, description, size = 'md', children, footer, bottomSheet }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full glass-card flex flex-col max-h-[90vh] animate-scale-in',
          sizeClasses[size],
          bottomSheet && 'sm:hidden fixed bottom-0 left-0 right-0 max-w-none rounded-b-none rounded-t-3xl max-h-[85vh]'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
            <div>
              <h2 id="modal-title" className="font-semibold text-white text-lg">{title}</h2>
              {description && <p className="text-slate-400 text-sm mt-0.5">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-4 flex-shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 p-5 border-t border-slate-700/50 flex-shrink-0 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
