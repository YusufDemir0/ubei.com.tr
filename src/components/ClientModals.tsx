'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Code-split interactive offscreen components to eliminate heavy client payload from initial HTML
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });
const FavoritesDrawer = dynamic(() => import('./FavoritesDrawer'), { ssr: false });
const ProductQuickView = dynamic(() => import('./ProductQuickView'), { ssr: false });

export default function ClientModals() {
  const pathname = usePathname() || '';
  if (pathname.startsWith('/admin')) return null;
  return (
    <>
      <CartDrawer />
      <FavoritesDrawer />
      <ProductQuickView />
    </>
  );
}
