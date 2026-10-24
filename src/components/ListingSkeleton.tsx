import React from 'react';
import { Skeleton, ProductGridSkeleton } from './Skeleton';

/**
 * Ürün listesi sayfasının (CategoryPage) iskeleti: başlık, sol filtre paneli ve ürün ızgarası.
 * `title` verilirse gerçek başlık, `children` verilirse ızgara yerine gerçek içerik gösterilir.
 */
export const ListingSkeleton: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="w-full bg-canvas min-h-screen" aria-busy="true">
    <div className="bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        <Skeleton className="h-3 w-40" />
        {title ? (
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink">{title}</h1>
        ) : (
          <Skeleton className="h-8 w-56" />
        )}
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="hidden lg:block bg-white p-5 rounded-xs border border-line space-y-6 h-fit" aria-hidden="true">
        {[6, 8, 4].map((rows, g) => (
          <div key={g} className="space-y-2.5">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: rows }, (_, i) => (
              <Skeleton key={i} className="h-3.5 w-full" />
            ))}
          </div>
        ))}
      </aside>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white p-4 rounded-xs border border-line flex justify-between" aria-hidden="true">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-44" />
        </div>
        {children ?? <ProductGridSkeleton count={6} />}
      </div>
    </div>
  </div>
);

export default ListingSkeleton;
