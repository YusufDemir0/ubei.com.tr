'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Sayfa geçiş göstergesi: dahili bir bağlantıya tıklanınca üstte ince bir çubuk ilerler, yeni sayfa gelince kapanır.
 * Yavaş bağlantıda ya da sunucu geç yanıt verdiğinde tıklamanın alındığı görünür olur (aksi halde menü
 * "tıklamayı dinlemiyor" gibi duruyordu).
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Yeni rota geldiğinde kapat
  useEffect(() => {
    setActive(false);
    if (timer.current) clearTimeout(timer.current);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // aynı sayfa
      setActive(true);
      // Güvenlik: hiçbir şey olmazsa çubuk 10 sn sonra kapanır
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setActive(false), 10000);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (!active) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 pointer-events-none" role="progressbar" aria-label="Sayfa yükleniyor">
      <div className="h-full bg-wood animate-nav-progress" />
    </div>
  );
}
