import React from 'react';
import type { Metadata } from 'next';
import { CartPage } from '../../components/CartPage';

export const metadata: Metadata = {
  title: 'Sepetim | UBEI',
  description: 'Sepetinizdeki ürünleri gözden geçirin ve siparişinizi tamamlayın.',
  openGraph: {
    title: 'Sepetim | UBEI',
    description: 'Sepetinizdeki ürünleri gözden geçirin ve siparişinizi tamamlayın.',
    url: 'https://ubei.com.tr/sepet/',
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ubei.com.tr/sepet/',
  },
};

export default function CartRoute() {
  return <CartPage />;
}
