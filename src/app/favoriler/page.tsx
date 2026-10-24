import React from 'react';
import type { Metadata } from 'next';
import { FavoritesPage } from '../../components/FavoritesPage';

export const metadata: Metadata = {
  title: 'Favorilerim | UBEI',
  description: 'Favorilerinize eklediğiniz ürünler.',
  openGraph: {
    title: 'Favorilerim | UBEI',
    description: 'Favorilerinize eklediğiniz ürünler.',
    url: 'https://ubei.com.tr/favoriler/',
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ubei.com.tr/favoriler/',
  },
};

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
