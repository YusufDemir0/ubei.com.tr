import React from 'react';
import type { Metadata } from 'next';
import { SalePage } from '../../components/SalePage';
import { productService } from '../../services/productService';


export const metadata: Metadata = {
  title: 'İndirimli Ürünler | UBEI',
  description: 'Powerbank, şarj cihazı, kılıf ve ekran koruyucularda indirimli fiyatlar.',
  openGraph: {
    title: 'İndirimli Ürünler | UBEI',
    description: 'Powerbank, şarj cihazı, kılıf ve ekran koruyucularda indirimli fiyatlar.',
    url: 'https://ubei.com.tr/indirimler/',
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ubei.com.tr/indirimler/',
  },
};

export default async function SaleRoute() {
  // Varsayılan 24 ürün limiti indirimli ürünlerin bir kısmını SSR HTML'inden düşürüyordu
  const products = await productService.getProducts({ limit: 60 });

  return <SalePage initialProducts={products} />;
}
