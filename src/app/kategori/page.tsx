import React, { Suspense } from 'react';
import CategorySsrFallback from '../../components/CategorySsrFallback';
import type { Metadata } from 'next';
import { CategoryPage } from '../../components/CategoryPage';
import { productService } from '../../services/productService';
import type { Product } from '../../types';


export const metadata: Metadata = {
  title: 'Tüm Ürünler | UBEI',
  description: 'Telefon kılıfları, ekran koruyucular, şarj cihazları, kablolar, powerbank, kulaklık ve araç aksesuarları.',
  openGraph: {
    title: 'Tüm Ürünler | UBEI',
    description: 'Telefon kılıfları, ekran koruyucular, şarj cihazları, kablolar, powerbank, kulaklık ve araç aksesuarları.',
    url: 'https://ubei.com.tr/kategori/',
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ubei.com.tr/kategori/',
  },
};

export default async function KategoriIndexPage() {
  let initialProducts: Product[] = [];
  try {
    const fetched = await productService.getProducts();
    if (Array.isArray(fetched)) {
      initialProducts = fetched;
    }
  } catch (e) {
    console.warn('KategoriIndexPage SSR ürün çekme uyarısı:', e);
  }

  return (
    <Suspense fallback={<CategorySsrFallback title="Tüm Ürünler" products={initialProducts} />}>
      <CategoryPage
        categorySlug="hepsi"
        initialProducts={initialProducts}
      />
    </Suspense>
  );
}
