import React from 'react';
import type { Product } from '../types';
import ListingSkeleton from './ListingSkeleton';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './Skeleton';

/**
 * Kategori sayfası istemcide (useSearchParams) render edildiği için sunucu HTML'i bu fallback'i içerir.
 * Ürünler sunucuda zaten çekildiğinden iskelet yerine gerçek kartlar basılır: yavaş bağlantıda ziyaretçi ürünleri
 * hemen görür, filtre paneli bir an sonra devreye girer. Arama motorları da ürün bağlantılarını görür.
 */
export default function CategorySsrFallback({ title, products }: { title: string; products: Product[] }) {
  return (
    <ListingSkeleton title={title}>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 12).map((p, idx) => (
            <ProductCard key={p.id} product={p} priority={idx < 3} />
          ))}
        </div>
      ) : (
        <ProductGridSkeleton count={6} />
      )}
    </ListingSkeleton>
  );
}
