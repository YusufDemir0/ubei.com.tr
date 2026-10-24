import { create } from 'zustand';
import type { Product } from '../types';

interface UIState {
  // Drawer visibility states
  isCartOpen: boolean;
  isFavoritesOpen: boolean;
  
  // Quick View Modal
  selectedQuickViewProduct: Product | null;

  // Search & Filtering scope
  searchQuery: string;
  searchCategory: string;
  homeSelectedCategory: string;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  openFavorites: () => void;
  closeFavorites: () => void;
  toggleFavorites: () => void;

  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  setSearchQuery: (query: string) => void;
  setSearchCategory: (category: string) => void;
  setHomeSelectedCategory: (category: string) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isFavoritesOpen: false,
  selectedQuickViewProduct: null,
  searchQuery: '',
  searchCategory: 'all',
  homeSelectedCategory: 'all',

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  openFavorites: () => set({ isFavoritesOpen: true }),
  closeFavorites: () => set({ isFavoritesOpen: false }),
  toggleFavorites: () => set((state) => ({ isFavoritesOpen: !state.isFavoritesOpen })),

  openQuickView: (product) => set({ selectedQuickViewProduct: product }),
  closeQuickView: () => set({ selectedQuickViewProduct: null }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchCategory: (category) => set({ searchCategory: category }),
  setHomeSelectedCategory: (category) => set({ homeSelectedCategory: category }),

  clearFilters: () =>
    set({
      searchQuery: '',
      searchCategory: 'all',
      homeSelectedCategory: 'all',
    }),
}));
