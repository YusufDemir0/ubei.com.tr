'use client';

import { useEffect } from 'react';

/**
 * Açık çekmece/pencere için ortak davranış: Esc ile kapanır, açıkken arka plan sayfası kaydırılmaz.
 */
export function useModalDismiss(open: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}
