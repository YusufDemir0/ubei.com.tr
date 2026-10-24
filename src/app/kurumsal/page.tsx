import React from 'react';
import type { Metadata } from 'next';
import PageRenderer from '../../components/page/PageRenderer';
import { resolvePageDoc } from '../../lib/pageLayout';

import { cmsService } from '../../services/cmsService';


export const metadata: Metadata = {
  title: 'Hakkımızda | UBEI',
  description: 'UBEI, telefon ve akıllı saat aksesuarlarını Türkiye\'nin her yerine gönderen bir online mağazadır.',
  openGraph: {
    title: 'Hakkımızda | UBEI',
    description: 'UBEI, telefon ve akıllı saat aksesuarlarını Türkiye\'nin her yerine gönderen bir online mağazadır.',
    url: 'https://ubei.com.tr/kurumsal/',
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ubei.com.tr/kurumsal/',
  },
};

/** Sayfanın tamamı Admin > CMS'teki sayfa düzeninden gelir (page_corporate). */
export default async function KurumsalPage() {
  const cms = await cmsService.getAllBlocks();
  const doc = resolvePageDoc('page_corporate', cms);
  return (
    <div className="w-full bg-canvas min-h-screen">
      <PageRenderer pageKey="page_corporate" initialDoc={doc} data={{}} />
    </div>
  );
}
