import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import AppInitializer from '../providers/AppInitializer';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import NavigationProgress from '../components/NavigationProgress';
import { Footer } from '../components/Footer';
import ClientModals from '../components/ClientModals';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import ToastContainer from '../components/ToastContainer';
import '../index.css';

// Fontlar build anında indirilip kendi sunucumuzdan servis edilir: render'ı bloklayan harici CSS yok,
// ziyaretçi IP'si Google'a gitmez (KVKK) ve layout kayması (CLS) önlenir.
// Gövde: IBM Plex Sans (teknik, Türkçe glifleri tam). Ölçü/kod/fiyat: IBM Plex Mono. Başlık: Archivo.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-plex-sans',
  weight: ['400', '500', '600', '700'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-plex-mono',
  weight: ['400', '500', '600'],
});

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-archivo',
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ubei.com.tr'),
  title: 'UBEI | Telefon Kılıfı, Şarj Cihazı ve Aksesuar',
  description: 'Telefon kılıfı, ekran koruyucu, şarj cihazı, kablo, powerbank ve kulaklık. Türkiye’nin her yerine aynı gün kargo, 14 gün kolay iade.',
  icons: {
    icon: [{ url: '/marka/simge.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    siteName: 'UBEI',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/kapak/kapak-1.webp', width: 1600, height: 900, alt: 'UBEI telefon aksesuarları' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${plexSans.variable} ${plexMono.variable} ${archivo.variable}`}>
      <body className="font-sans flex flex-col min-h-screen bg-white text-ink antialiased">
        <AppInitializer>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Navbar />
          <BackButton />
          <main className="flex-1">{children}</main>
          <Footer />
          <ClientModals />
          <FloatingWhatsApp />
          <ToastContainer />
        </AppInitializer>
      </body>
    </html>
  );
}
