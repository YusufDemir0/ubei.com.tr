import React from 'react';

/**
 * İskelet yükleme blokları: sepya tonunda, hafif nabız (hareketi azalt tercihinde durur, bkz. index.css).
 * Gerçek içeriğin ölçülerini korur; içerik gelince sayfa zıplamaz.
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-paper-deep/70 rounded-xs ${className}`} aria-hidden="true" />
);

/** Satır içi kullanım (span, dd, p içinde geçerli HTML) */
export const InlineSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-block align-middle animate-pulse bg-paper-deep/70 rounded-xs ${className}`} aria-hidden="true" />
);

/** Ürün kartı iskeleti (ProductCard ile aynı oranlar) */
export const ProductCardSkeleton: React.FC = () => (
  <div className="flex flex-col bg-white border border-line rounded-xs overflow-hidden" aria-hidden="true">
    <Skeleton className="aspect-square rounded-none" />
    <div className="p-4 space-y-2.5">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex items-end justify-between pt-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-10 md:w-28" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
}) => (
  <div className={className} role="status" aria-label="Ürünler yükleniyor">
    {Array.from({ length: count }, (_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
    <span className="sr-only">Ürünler yükleniyor…</span>
  </div>
);

/** Metin satırları (paragraf yerine) */
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

/** Liste/tablo satırları (admin ekranları) */
export const RowsSkeleton: React.FC<{ rows?: number; label?: string }> = ({ rows = 5, label = 'Yükleniyor' }) => (
  <div className="divide-y divide-line" role="status" aria-label={label}>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4" aria-hidden="true">
        <Skeleton className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    ))}
    <span className="sr-only">{label}…</span>
  </div>
);

export default Skeleton;
