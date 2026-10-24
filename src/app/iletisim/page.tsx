import React from 'react';
import type { Metadata } from 'next';
import PageRenderer from '../../components/page/PageRenderer';
import { resolvePageDoc } from '../../lib/pageLayout';
import { cmsService } from '../../services/cmsService';
import { storeLd } from '../../lib/structuredData';


interface CmsContact {
  phone?: string;
  phoneSecondary?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  workingHours?: string;
}


export const metadata: Metadata = {
  title: 'İletişim | UBEI',
  description: 'Sipariş, iade ve ürün uyumluluğu soruları için UBEI müşteri hizmetlerine WhatsApp ya da e-posta ile ulaşın.',
  openGraph: {
    title: 'İletişim | UBEI',
    description: 'Sipariş, iade ve ürün uyumluluğu soruları için UBEI müşteri hizmetlerine WhatsApp ya da e-posta ile ulaşın.',
    url: 'https://ubei.com.tr/iletisim/',
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ubei.com.tr/iletisim/',
  },
};

export default async function IletisimPage() {
  // İletişim bilgileri İçerik > İletişim bilgileri'nden, sayfa düzeni CMS > Tasarım'dan gelir
  const blocks = await cmsService.getAllBlocks();
  const cms = ((blocks.contact || blocks.contact_info) as CmsContact) || {};
  // Yalnız Admin'de kayıtlı bilgiler gösterilir; boş alanın kartı çıkmaz
  const contactInfo = {
    phones: [cms.phone, cms.phoneSecondary].filter((p): p is string => Boolean(p && p.trim())),
    email: cms.email || '',
    address: cms.address || '',
    workingHours: cms.workingHours || '',
  };
  const doc = resolvePageDoc('page_contact', blocks);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'UBEI İletişim',
    url: 'https://ubei.com.tr/iletisim',
    mainEntity: storeLd(cms),
  };

  return (
    <div className="w-full bg-canvas min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PageRenderer pageKey="page_contact" initialDoc={doc} data={{ contact: contactInfo }} />
    </div>
  );
}
