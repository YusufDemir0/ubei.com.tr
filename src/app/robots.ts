import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/talep/'] }],
    sitemap: 'https://ubei.com.tr/sitemap.xml',
    host: 'https://ubei.com.tr',
  };
}
