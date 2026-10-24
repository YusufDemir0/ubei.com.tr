import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, CartItem } from '../types';
import { useUIStore } from './useUIStore';

export function getCartItemKey(product: Product): string {
  const colorKey = product.selectedColor?.trim().toLowerCase() || 'default';
  const variantKey = product.selectedVariant?.trim().toLowerCase() || 'default';
  const piecesKey = product.selectedPieces && product.selectedPieces.length > 0
    ? [...product.selectedPieces].sort().join('-').toLowerCase()
    : 'all';
  return `${product.id}::${colorKey}::${variantKey}::${piecesKey}`;
}

interface CartState {
  cartItems: CartItem[];

  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (keyOrProductId: string, quantity: number) => void;
  removeItem: (keyOrProductId: string) => void;
  clearCart: () => void;

  // Computed values
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product, quantity = 1) => {
        const itemKey = getCartItemKey(product);
        set((state) => {
          const existingItemIndex = state.cartItems.findIndex(
            (item) => (item.itemKey || getCartItemKey(item.product)) === itemKey
          );
          if (existingItemIndex > -1) {
            const updatedItems = [...state.cartItems];
            updatedItems[existingItemIndex].quantity += quantity;
            return { cartItems: updatedItems };
          }
          return { cartItems: [...state.cartItems, { itemKey, product, quantity }] };
        });

        // Trigger interactive cart drawer feedback
        useUIStore.getState().openCart();
      },

      updateQuantity: (keyOrProductId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(keyOrProductId);
          return;
        }
        set((state) => ({
          cartItems: state.cartItems.map((item) => {
            const currentKey = item.itemKey || getCartItemKey(item.product);
            if (currentKey === keyOrProductId || item.product.id === keyOrProductId) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      removeItem: (keyOrProductId) => {
        set((state) => {
          // If keyOrProductId exactly matches an itemKey, remove only that item
          const hasKeyMatch = state.cartItems.some(
            (item) => (item.itemKey || getCartItemKey(item.product)) === keyOrProductId
          );
          if (hasKeyMatch) {
            return {
              cartItems: state.cartItems.filter(
                (item) => (item.itemKey || getCartItemKey(item.product)) !== keyOrProductId
              ),
            };
          }
          // Fallback to productId
          return {
            cartItems: state.cartItems.filter((item) => item.product.id !== keyOrProductId),
          };
        });
      },

      clearCart: () => set({ cartItems: [] }),

      getTotalCount: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().cartItems.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'ubei_cart',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      skipHydration: true,
    }
  )
);
