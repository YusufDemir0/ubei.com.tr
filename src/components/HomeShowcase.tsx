import React from 'react';
import PageRenderer from './page/PageRenderer';
import { productService } from '../services/productService';
import { cmsService } from '../services/cmsService';
import { resolvePageDoc } from '../lib/pageLayout';
import { storeLd, type CmsContactLike } from '../lib/structuredData';
import type { Product } from '../types';

/**
 * Vitrin (showroom) ana sayfa içeriği. Hem `/` (açılış tercihi "home" iken) hem de `/anasayfa` tarafından kullanılır.
 */
export default async function HomeShowcase() {
  let products: Product[] = [];
  const cmsPromise = cmsService.getAllBlocks();
  try {
    const fetched = await productService.getProducts({ limit: 24 });
    if (fetched && fetched.length > 0) {
      products = fetched;
    }
  } catch (e) {
    console.warn('HomePage SSR ürün çekme uyarısı:', e);
  }

  const cms = await cmsPromise;
  const contact = (cms.contact || cms.contact_info || {}) as CmsContactLike;
  const jsonLd = {
    '@context': 'https://schema.org',
    ...storeLd(contact),
    description: 'Telefon kılıfı, ekran koruyucu, şarj cihazı, kablo, powerbank ve kulaklık satan online aksesuar mağazası.',
  };

  return (
    <div className="w-full bg-white text-ink">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Sayfanın tek H1'i: hero slaytları istemcide yüklendiği için sunucu HTML'inde her zaman bulunmalı */}
      <h1 className="sr-only">UBEI | Telefon ve akıllı saat aksesuarları</h1>

      <PageRenderer pageKey="page_home" initialDoc={resolvePageDoc('page_home', cms)} data={{ products }} />
    </div>
  );
}
