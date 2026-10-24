'use client';

import React from 'react';
import { useToastStore, type ToastType } from '../stores/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-ok flex-shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-signal flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-wood flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-wood flex-shrink-0" />,
};

// Beyaz zemin + soldaki renk çizgisi; tür, ikon ve çizgi rengiyle ayrılır
const borderStyles: Record<ToastType, string> = {
  success: 'border-l-ok',
  error: 'border-l-signal',
  info: 'border-l-wood',
  warning: 'border-l-wood',
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xs bg-white text-ink border border-line border-l-4 shadow-xl animate-fade-in ${
            borderStyles[toast.type]
          }`}
          role="alert"
        >
          <div className="pt-0.5">{icons[toast.type]}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug">
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-sm text-neutral-600 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="h-8 w-8 -mr-1 -mt-1 flex items-center justify-center rounded-xs hover:bg-paper transition-colors cursor-pointer text-neutral-500 hover:text-ink"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
