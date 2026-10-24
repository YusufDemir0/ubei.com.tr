'use client';

import { useEffect, ReactNode } from 'react';
import { useCMSStore } from '../stores/useCMSStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';

/**
 * Global App & Store Initializer (Pure lightweight state synchronizer)
 * Fetches and synchronizes authentic backend CMS data upon application load.
 */
export default function AppInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Rehydrate stores on client to prevent SSR hydration mismatch
    useCartStore.persist.rehydrate();
    useFavoritesStore.persist.rehydrate();

    const store = useCMSStore.getState();
    store.fetchCmsBlocks();
    store.fetchProductsAndCategories();
    store.fetchStores();
  }, []);

  return <>{children}</>;
}
