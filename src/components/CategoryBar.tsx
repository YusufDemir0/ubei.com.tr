'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import type { Category } from '../types';

interface CategoryBarProps {
  rootCategories: Category[];
  sortedCategories: Category[];
  pathname: string;
}

/**
 * Ürün sayfalarındaki kategori çubuğu.
 * - Fare çubuğun üzerindeyken tekerlek yatay kaydırır; çubuğun sonuna gelince sayfa kaydırması devralır.
 * - Alt kategori menüsü portal + fixed konumla çizilir; yatay taşma alanında kırpılmaz.
 */
export const CategoryBar: React.FC<CategoryBarProps> = ({ rootCategories, sortedCategories, pathname }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<{ id: string; left: number; top: number } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // React onWheel pasif olduğu için preventDefault çalışmaz; dinleyici elle (passive: false) eklenir
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const atStart = el.scrollLeft <= 0 && delta < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && delta > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += delta;
      setOpenMenu(null);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Sayfa kayınca açık alt menü kapanır (fixed konum eskir)
  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [openMenu]);

  const openFor = (id: string, target: HTMLElement) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = target.getBoundingClientRect();
    setOpenMenu({ id, left: rect.left, top: rect.bottom });
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  const openCat = openMenu ? rootCategories.find((c) => c.id === openMenu.id) : null;
  const openChildren = openCat ? sortedCategories.filter((c) => c.parentId === openCat.id) : [];

  return (
    <nav aria-label="Kategoriler" className="relative z-30 bg-paper border-b border-line">
      <div
        ref={scrollRef}
        className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar overscroll-x-contain"
      >
        {rootCategories.map((cat) => {
          const children = sortedCategories.filter((c) => c.parentId === cat.id);
          const isActive =
            pathname === `/kategori/${cat.slug}` || children.some((c) => pathname === `/kategori/${c.slug}`);
          return (
            <div
              key={cat.id}
              className="shrink-0"
              onMouseEnter={(e) => children.length > 0 && openFor(cat.id, e.currentTarget)}
              onMouseLeave={scheduleClose}
            >
              <Link
                href={`/kategori/${cat.slug}`}
                onFocus={(e) => children.length > 0 && openFor(cat.id, e.currentTarget.parentElement as HTMLElement)}
                className={`flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-sm border-b-2 transition-colors ${
                  isActive ? 'border-ink text-ink font-semibold' : 'border-transparent text-neutral-700 hover:text-ink'
                }`}
                aria-haspopup={children.length > 0 ? 'true' : undefined}
                aria-expanded={children.length > 0 ? openMenu?.id === cat.id : undefined}
              >
                <span>{cat.name}</span>
                {children.length > 0 && <ChevronDown className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />}
              </Link>
            </div>
          );
        })}
      </div>

      {openMenu &&
        openCat &&
        openChildren.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-50 min-w-[220px] bg-white border border-line shadow-xl rounded-xs py-1.5 animate-fade-in"
            style={{ left: Math.min(openMenu.left, window.innerWidth - 240), top: openMenu.top }}
            onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
            onMouseLeave={scheduleClose}
          >
            {openChildren.map((subCat) => {
              const isSubActive = pathname === `/kategori/${subCat.slug}`;
              return (
                <Link
                  key={subCat.id}
                  href={`/kategori/${subCat.slug}`}
                  onClick={() => setOpenMenu(null)}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    isSubActive ? 'bg-paper text-ink font-semibold' : 'text-neutral-700 hover:bg-paper hover:text-ink'
                  }`}
                >
                  {subCat.name}
                </Link>
              );
            })}
          </div>,
          document.body
        )}
    </nav>
  );
};

export default CategoryBar;
