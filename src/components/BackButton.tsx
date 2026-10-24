'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Ana sayfa ve yönetim panelinde gösterilmez
const HIDDEN = new Set(['/', '/anasayfa']);

// Bu sekmedeki site içi gezinme yığını. Yeni sayfa yığına eklenir; bir önceki sayfaya dönülürse son öğe çıkarılır.
// Yığında önceki bir sayfa varsa "geri" tarayıcı geçmişini kullanır, yoksa (siteye doğrudan gelindiyse) üst sayfaya gider.
const navStack: string[] = [];

/** Doğrudan gelinen sayfalarda "geri" için mantıksal üst sayfa */
const parentOf = (path: string): string => {
  if (path.startsWith('/urun/')) return '/kategori';
  if (path.startsWith('/kategori/')) return '/kategori';
  if (path.startsWith('/talep/')) return '/';
  if (path === '/talep') return '/sepet';
  return '/';
};

/**
 * Ekranın sol üstünde (site kapsayıcısına değil ekran kenarına hizalı) geri butonu.
 * Site içinden gelindiyse tarayıcı geçmişinde bir adım geri, doğrudan gelindiyse mantıksal üst sayfaya gider.
 */
export const BackButton: React.FC = () => {
  const pathname = usePathname() || '/';
  const router = useRouter();

  useEffect(() => {
    const top = navStack[navStack.length - 1];
    if (top === pathname) return;
    if (navStack[navStack.length - 2] === pathname) navStack.pop();
    else navStack.push(pathname);
  }, [pathname]);

  if (HIDDEN.has(pathname) || pathname.startsWith('/admin')) return null;

  const goBack = () => {
    if (navStack.length > 1) router.back();
    else router.push(parentOf(pathname));
  };

  return (
    <div className="h-11 flex items-center px-3 sm:px-4 print:hidden">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1.5 h-9 pl-2 pr-3 rounded-xs text-sm text-neutral-700 hover:text-ink hover:bg-paper border border-transparent hover:border-line transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Geri</span>
      </button>
    </div>
  );
};

export default BackButton;
