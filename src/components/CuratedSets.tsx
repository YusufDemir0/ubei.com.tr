'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import { getProductImage } from '../lib/productImages';
import OptimizedImage from './OptimizedImage';
import { Skeleton, TextSkeleton } from './Skeleton';
import type { Product } from '../types';

const currencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
const formatPrice = (amount: number) => currencyFormatter.format(amount).replace('TRY', 'TL');

/**
 * Takımlar: katalogda parça listesi (setPieces) tanımlı gerçek ürünler. Koda gömülü set, fiyat veya görsel yok;
 * uygun ürün yoksa bölüm hiç görünmez.
 */
interface CuratedSetsProps {
  title?: string;
  subtitle?: string;
}

export const CuratedSets: React.FC<CuratedSetsProps> = ({
  title = 'Setler',
  subtitle = 'Birlikte alınan ürünler.',
}) => {
  const products = useCMSStore((state) => state.products);
  const catalogLoaded = useCMSStore((state) => state.catalogLoaded);

  const sets = React.useMemo(
    () =>
      products
        .filter((p: Product) => Array.isArray(p.setPieces) && p.setPieces.length >= 3)
        .sort((a, b) => (b.setPieces?.length ?? 0) - (a.setPieces?.length ?? 0))
        .slice(0, 3),
    [products]
  );

  if (!catalogLoaded) {
    return (
      <section className="py-12 md:py-16" aria-busy="true" aria-label="Setler yükleniyor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-line border border-line">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white">
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <TextSkeleton lines={4} />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (sets.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-1">
            {title && <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-neutral-600 max-w-xl">{subtitle}</p>}
          </div>
          <Link href="/kategori" className="inline-flex items-center gap-2 text-sm font-semibold text-wood hover:text-ink transition-colors group">
            <span>Tüm ürünler</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-line border border-line">
          {sets.map((product) => {
            const href = `/urun/${product.slug || product.id}`;
            const price = Number(product.price);
            const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
            return (
              <article key={product.id} className="bg-white flex flex-col">
                <Link href={href} className="relative aspect-[16/10] overflow-hidden bg-paper block group">
                  <OptimizedImage
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="space-y-1">
                    {product.erpItemCode && <span className="font-mono text-xs text-neutral-500">{product.erpItemCode}</span>}
                    <h3 className="font-display text-lg font-semibold text-ink leading-snug">
                      <Link href={href} className="hover:text-wood transition-colors">{product.name}</Link>
                    </h3>
                  </div>

                  <ol className="text-sm text-neutral-700 divide-y divide-line border-y border-line">
                    {product.setPieces!.map((piece, idx) => (
                      <li key={piece.id || idx} className="flex items-baseline gap-3 py-1.5">
                        <span className="font-mono text-xs text-steel tabular-nums-all">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="flex-1">{piece.title}</span>
                        {piece.isOptional && <span className="text-xs text-neutral-500">isteğe bağlı</span>}
                      </li>
                    ))}
                  </ol>

                  <div className="mt-auto flex items-end justify-between gap-4">
                    <div>
                      {originalPrice && originalPrice > price && (
                        <span className="block text-xs text-neutral-500 line-through tabular-nums-all">{formatPrice(originalPrice)}</span>
                      )}
                      <span className={`font-mono text-lg font-semibold tabular-nums-all ${originalPrice && originalPrice > price ? 'text-signal' : 'text-ink'}`}>
                        {formatPrice(price)}
                      </span>
                    </div>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xs transition-colors"
                    >
                      <span>Seti incele</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CuratedSets;
