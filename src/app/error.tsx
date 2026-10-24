'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for monitoring/observability
    console.error('Unhandled runtime error in UBEI application:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-line shadow-xl rounded-xs p-8 text-center space-y-6">
        <div className="inline-flex p-4 bg-signal/5 text-signal rounded-full">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900">
            Bir Beklenmeyen Hata Oluştu
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Sistemde geçici bir aksaklık yaşandı. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
          </p>
        </div>

        {error.digest && (
          <div className="bg-neutral-100 p-2.5 rounded-xs text-xs font-mono text-neutral-500 truncate">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-6 rounded-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tekrar Deneyin</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-semibold py-3 px-6 rounded-xs transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
