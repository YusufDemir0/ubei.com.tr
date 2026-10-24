'use client';

import React from 'react';
import Link from 'next/link';
import { useCMSStore } from '../stores/useCMSStore';
import { getProductImage } from '../lib/productImages';
import OptimizedImage from './OptimizedImage';
import { Skeleton } from './Skeleton';
import type { Category, Product } from '../types';

interface CategoryListProps {
  title?: string;
  subtitle?: string;
}

const productCategoryId = (p: Product): string | undefined => {
  if (p.categoryId) return p.categoryId;
  if (p.category_id) return p.category_id;
  if (typeof p.category === 'object' && p.category) return p.category.id;
  return undefined;
};

const isRealImage = (src?: string | null) =>
  typeof src === 'string' && src.trim().length > 0 && !src.includes('default-furniture');

/**
 * Ana sayfa kategori bandı: sonsuz kayan yuvarlak görseller, altında kategori adı.
 * Görsel önceliği: kategorinin kendi görseli → o kategorideki (veya alt kategorisindeki) ilk ürünün kapak görseli.
 * Üzerine gelince balon ~%40 büyür ve görsel belirginleşir; bant durur.
 */
export const CategoryList: React.FC<CategoryListProps> = ({ title: propTitle, subtitle: propSubtitle }) => {
  const storeCategories = useCMSStore((state) => state.categories);
  const products = useCMSStore((state) => state.products);
  const homeConfig = useCMSStore((state) => state.homeConfig);
  const catalogLoaded = useCMSStore((state) => state.catalogLoaded);

  const title = propTitle || homeConfig.categoriesTitle || 'Kategoriler';
  const subtitle = propSubtitle || homeConfig.categoriesSubtitle || '';

  const items = React.useMemo(() => {
    const roots = storeCategories.filter((c) => !c.parentId);
    const list = (roots.length > 0 ? roots : storeCategories).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return list.map((cat: Category) => {
      if (isRealImage(cat.image)) return { cat, image: cat.image };
      const familyIds = new Set([cat.id, ...storeCategories.filter((c) => c.parentId === cat.id).map((c) => c.id)]);
      const inFamily = products.filter((p) => {
        const cid = productCategoryId(p);
        return cid && familyIds.has(cid);
      });
      // Gerçek ürün fotoğrafı yoksa (henüz yüklenmediyse) yer tutucu görsel de kabul edilir; kategori görseli
      // Admin > Kategoriler'den yüklendiğinde otomatik olarak o kullanılır.
      const product = inFamily.find((p) => isRealImage(getProductImage(p))) || inFamily.find((p) => getProductImage(p));
      return { cat, image: product ? getProductImage(product) : '' };
    });
  }, [storeCategories, products]);

  if (!catalogLoaded) {
    return (
      <section className="py-10 md:py-14" aria-busy="true" aria-label="Kategoriler yükleniyor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-0 overflow-hidden py-8 px-2">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex flex-col items-center w-32 md:w-40 shrink-0 px-2 gap-3">
              <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-full" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  // Kısa listede de bant dolsun diye en az 10 balon; iki kopya halinde -50% kayar
  const repeats = Math.max(1, Math.ceil(10 / items.length));
  const run = Array.from({ length: repeats }, () => items).flat();

  return (
    <section id="quick-categories" className="py-10 md:py-14" aria-labelledby="quick-categories-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-2 mb-2">
        <h2 id="quick-categories-title" className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-neutral-600 max-w-md md:text-right">{subtitle}</p>}
      </div>

      {/* Erişilebilir sabit liste (görsel bant aria-hidden) */}
      <ul className="sr-only">
        {items.map(({ cat }) => (
          <li key={cat.id}>
            <Link href={`/kategori/${cat.slug || cat.id}`}>{cat.name}</Link>
          </li>
        ))}
      </ul>

      <div className="marquee-pause overflow-hidden py-8" aria-hidden="true">
        <div className="animate-marquee" style={{ ['--marquee-duration' as string]: `${run.length * 3.5}s` }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {run.map(({ cat, image }, idx) => (
                <Link
                  key={`${copy}-${cat.id}-${idx}`}
                  href={`/kategori/${cat.slug || cat.id}`}
                  tabIndex={-1}
                  className="group flex flex-col items-center w-32 md:w-40 shrink-0 px-2"
                >
                  <span className="relative block h-24 w-24 md:h-28 md:w-28 rounded-full overflow-hidden bg-paper ring-2 ring-line transition-transform duration-300 ease-out group-hover:scale-[1.4] group-hover:ring-brand group-hover:z-10 group-hover:shadow-xl">
                    {image ? (
                      <OptimizedImage
                        src={image}
                        alt=""
                        fill
                        className="object-cover saturate-[0.8] brightness-95 transition duration-300 group-hover:saturate-100 group-hover:brightness-105"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-wood">
                        {cat.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="mt-3 text-sm font-medium text-ink text-center leading-snug line-clamp-2 transition-transform duration-300 group-hover:translate-y-4">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryList;
