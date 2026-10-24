import type { Metadata } from 'next';
import HomeShowcase from '../components/HomeShowcase';


export const metadata: Metadata = {
  title: 'UBEI | Telefon Kılıfı, Şarj Cihazı ve Aksesuar',
  description: 'Telefon kılıfı, ekran koruyucu, şarj cihazı, kablo, powerbank ve kulaklık. Türkiye\'nin her yerine aynı gün kargo, 14 gün kolay iade.',
  openGraph: {
    title: 'UBEI | Telefon Kılıfı, Şarj Cihazı ve Aksesuar',
    description: 'Telefon kılıfı, ekran koruyucu, şarj cihazı, kablo, powerbank ve kulaklık. Türkiye\'nin her yerine aynı gün kargo, 14 gün kolay iade.',
    url: 'https://ubei.com.tr/',
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ubei.com.tr/',
  },
};

export default function HomePage() {
  return <HomeShowcase />;
}
