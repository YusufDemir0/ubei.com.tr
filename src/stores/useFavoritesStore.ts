import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '../types';

interface FavoritesState {
  favorites: Product[];

  toggleFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (product) => {
        set((state) => {
          const exists = state.favorites.some((fav) => fav.id === product.id);
          if (exists) {
            return {
              favorites: state.favorites.filter((fav) => fav.id !== product.id),
            };
          }
          return { favorites: [...state.favorites, product] };
        });
      },

      removeFavorite: (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== productId),
        }));
      },

      isFavorite: (productId) => {
        return get().favorites.some((fav) => fav.id === productId);
      },

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'ubei_favorites',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      skipHydration: true,
    }
  )
);
