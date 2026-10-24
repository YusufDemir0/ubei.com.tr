import type { MetadataRoute } from 'next';
import { categories, products } from '../mock/data';

export const dynamic = 'force-static';

const BASE = 'https://ubei.com.tr';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ['', '/kategori/', '/indirimler/', '/iletisim/', '/kurumsal/'].map((p) => ({
    url: `${BASE}${p || '/'}`,
    lastModified: now,
  }));
  return [
    ...pages,
    ...categories.map((c) => ({ url: `${BASE}/kategori/${c.slug}/`, lastModified: now })),
    ...products.map((p) => ({ url: `${BASE}/urun/${p.slug}/`, lastModified: now })),
  ];
}
