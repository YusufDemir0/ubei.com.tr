import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: ({ type, title, message, duration = 3500 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, type, title, message, duration };

    set((state) => ({
      // Keep maximum 4 concurrent toasts to avoid clutter
      toasts: [...state.toasts.slice(-3), newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

/**
 * Convenience helper for triggering toasts from anywhere in the app
 */
export const toast = {
  success: (title: string, message?: string, duration = 3500) =>
    useToastStore.getState().addToast({ type: 'success', title, message, duration }),

  error: (title: string, message?: string, duration = 4500) =>
    useToastStore.getState().addToast({ type: 'error', title, message, duration }),

  info: (title: string, message?: string, duration = 3000) =>
    useToastStore.getState().addToast({ type: 'info', title, message, duration }),

  warning: (title: string, message?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, duration }),
};
