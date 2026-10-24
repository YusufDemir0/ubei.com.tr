import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchX, Home, LayoutGrid, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı | UBEI',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-line shadow-xl rounded-xs p-8 text-center space-y-6">
        <div className="inline-flex p-4 bg-paper text-wood rounded-full">
          <SearchX className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-wood">Hata 404</p>
          <h1 className="text-xl font-bold text-neutral-900">Aradığınız Sayfa Bulunamadı</h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Ürün yayından kaldırılmış veya bağlantı değişmiş olabilir. Tüm ürünlerimize göz atabilir ya da bize WhatsApp üzerinden ulaşabilirsiniz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/kategori"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-6 rounded-xs transition-colors"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Tüm Ürünler</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-semibold py-3 px-6 rounded-xs transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
        </div>

        <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900">
          <MessageCircle className="h-3.5 w-3.5" />
          Yardım mı lazım? Bize ulaşın
        </Link>
      </div>
    </div>
  );
}
