'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

function Tamam() {
  const kod = useSearchParams().get('kod') || '';
  return (
    <div className="w-full bg-canvas min-h-[70vh] py-16 px-4">
      <div className="max-w-xl mx-auto bg-white border border-line rounded-xs p-8 sm:p-10 text-center space-y-5">
        <CheckCircle2 className="h-14 w-14 text-ok mx-auto" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-ink">Siparişiniz alındı</h1>
        {kod && (
          <p className="text-sm text-neutral-600">
            Sipariş numaranız <strong className="font-mono text-ink">{kod}</strong>
          </p>
        )}
        <p className="text-sm text-neutral-700 leading-relaxed">
          Gerçek bir mağazada bu adımda siparişiniz WhatsApp’tan onaylanır ve kargo takip numarası gönderilir.
        </p>
        <p className="text-sm bg-paper border border-line rounded-xs p-4 text-ink">
          UBEI örnek bir mağazadır; sipariş oluşmadı ve bilgileriniz hiçbir yere gönderilmedi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/" className="h-11 px-5 inline-flex items-center justify-center bg-ink text-white text-sm font-semibold rounded-xs">
            Alışverişe devam edin
          </Link>
          <a href="https://yusufdemir.com.tr/projeler/#ubei" className="h-11 px-5 inline-flex items-center justify-center border border-line-strong text-ink text-sm font-semibold rounded-xs">
            Bu siteyi kim yaptı?
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SiparisTamamPage() {
  return (
    <Suspense fallback={null}>
      <Tamam />
    </Suspense>
  );
}
