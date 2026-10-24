'use client';

import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '../types';

interface ProductGridClientProps {
  initialProducts?: Product[];
  featuredTitle?: string;
  subtitle?: string;
  /** Gösterilecek en fazla ürün */
  limit?: number;
}

export default function ProductGridClient({
  initialProducts = [],
  featuredTitle = 'Ürünler',
  subtitle = '',
  limit = 8,
}: ProductGridClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'new'>('featured');

  const products = initialProducts;

  const displayedProducts = React.useMemo(() => {
    const featuredProducts = products.filter((p) => p.badge?.includes('Öne Çıkan') || p.rating >= 4.8);
    const newArrivals = products.slice(0, limit);

    if (activeTab === 'all') return products.slice(0, limit);
    if (activeTab === 'featured') {
      return featuredProducts.length > 0 ? featuredProducts.slice(0, limit) : products.slice(0, limit);
    }
    return newArrivals;
  }, [products, activeTab, limit]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header with Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
            {featuredTitle}
          </h2>
          {subtitle && <p className="text-sm text-neutral-600 max-w-xl">{subtitle}</p>}
        </div>

        {/* Showcase Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'featured', label: 'Öne çıkanlar' },
            { id: 'new', label: 'Yeni eklenenler' },
            { id: 'all', label: 'Tümü' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'featured' | 'new')}
                aria-pressed={isActive}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'border-ink text-ink'
                    : 'border-transparent text-neutral-600 hover:text-ink'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product, idx) => (
          <ProductCard key={product.id} product={product} priority={idx < 4} />
        ))}
      </div>

      {/* View Catalog Button */}
      <div className="text-center pt-4">
        <Link
          href="/kategori"
          className="inline-flex items-center gap-2.5 border border-ink text-ink hover:bg-ink hover:text-white text-sm font-semibold py-3 px-6 transition-colors rounded-xs"
        >
          <span>Tüm ürünler</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
