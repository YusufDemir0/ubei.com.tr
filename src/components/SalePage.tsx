'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { LayoutGrid, List, SlidersHorizontal, ShoppingBag, Eye, Heart, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';
import { useCMSStore } from '../stores/useCMSStore';
import { useUIStore } from '../stores/useUIStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { OptimizedImage } from './OptimizedImage';
import { searchFold } from '../lib/searchText';

interface SalePageProps {
  initialProducts?: Product[];
}

// Module-level cached price formatter
const saleCurrencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
});

const formatPrice = (price: number): string => {
  return saleCurrencyFormatter.format(price).replace('TRY', 'TL');
};

const getDiscountRate = (price: number, originalPrice?: number) => {
  if (!originalPrice) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const SaleBadge = memo(() => {
  return (
    <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-xs">
      <span className="text-xs text-neutral-200">Stoklarla sınırlı</span>
      <span className="text-xs font-semibold text-wood-light">1.000 TL üzeri kargo ücretsiz</span>
    </div>
  );
});

SaleBadge.displayName = 'SaleBadge';

export const SalePage: React.FC<SalePageProps> = ({
  initialProducts = [],
}) => {
  // Use Firebase-synced products from CMS store
  const firebaseProducts = useCMSStore((state) => state.products);
  const allProducts = firebaseProducts.length > 0 ? firebaseProducts : initialProducts;
  const searchQuery = useUIStore((state) => state.searchQuery);
  const searchCategory = useUIStore((state) => state.searchCategory);
  const openQuickView = useUIStore((state) => state.openQuickView);

  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const addToCart = useCartStore((state) => state.addToCart);

  // --- FILTERS STATE ---
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Applied values
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | ''>('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | ''>('');

  // --- CATALOG CONTROLS ---
  const [sortBy, setSortBy] = useState<string>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter ONLY discounted items (i.e. originalPrice exists)
  const campaignBaseProducts = useMemo(() => allProducts.filter(p => !!p.originalPrice && p.originalPrice > p.price), [allProducts]);

  // Kategori filtresi yalnızca indirimli ürünü olan GERÇEK kategorilerden üretilir (sabit slug listesi eşleşmiyordu)
  const saleCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const p of campaignBaseProducts) {
      if (typeof p.category !== 'object' || p.category === null || !p.category.slug) continue;
      const existing = map.get(p.category.slug);
      if (existing) existing.count++;
      else map.set(p.category.slug, { id: p.category.slug, name: p.category.name, count: 1 });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [campaignBaseProducts]);

  // Filter application - memoized for performance
  const filteredProducts = useMemo(() => {
    return campaignBaseProducts.filter((product) => {
      // 1. Navbar Search query matching
      const matchesSearch =
        searchFold(product.name).includes(searchFold(searchQuery)) ||
        searchFold(product.description).includes(searchFold(searchQuery));
      
      const catSlug = typeof product.category === 'object' && product.category !== null ? product.category.slug : String(product.category || '');
      
      // 2. Navbar Category dropdown matching
      const matchesNavbarCategory = searchCategory === 'all' || catSlug === searchCategory;

      // 3. Sidebar Category matching
      const matchesSidebarCategory = selectedCats.length === 0 || selectedCats.includes(catSlug);

      // 4. Sidebar Price inputs
      const matchesMinPrice = appliedMinPrice === '' || product.price >= appliedMinPrice;
      const matchesMaxPrice = appliedMaxPrice === '' || product.price <= appliedMaxPrice;

      // 5. Sidebar Discount threshold
      const discount = getDiscountRate(product.price, product.originalPrice);
      const matchesDiscount = discount >= minDiscount;

      // 6. Sidebar Stock
      const matchesStock = !inStockOnly || product.inStock;

      return matchesSearch && matchesNavbarCategory && matchesSidebarCategory && matchesMinPrice && matchesMaxPrice && matchesDiscount && matchesStock;
    });
  }, [campaignBaseProducts, searchQuery, searchCategory, selectedCats, appliedMinPrice, appliedMaxPrice, minDiscount, inStockOnly]);

  // Sorting - memoized
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.salesCount || 0) - (a.salesCount || 0);
      if (sortBy === 'discount') {
        const discA = getDiscountRate(a.price, a.originalPrice);
        const discB = getDiscountRate(b.price, b.originalPrice);
        return discB - discA;
      }
      return 0; // default order
    });
  }, [filteredProducts, sortBy]);

  // Pagination bounds
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = useMemo(() => {
    return sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedProducts, indexOfFirstItem, indexOfLastItem]);

  const handleCategoryCheckboxChange = (catId: string) => {
    setSelectedCats((prev) => {
      const next = prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId];
      setCurrentPage(1);
      return next;
    });
  };

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCats([]);
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setMinDiscount(0);
    setInStockOnly(false);
    setSortBy('default');
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-canvas min-h-screen">
      {/* Kampanya şeridi */}
      <div className="bg-ink text-white py-4 px-4 border-b-4 border-signal">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm md:text-base">
              Seçili ürünlerde <strong className="font-semibold">%20&apos;ye varan indirim</strong>
            </h2>
          </div>
          
          <SaleBadge />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTER SIDEBAR (LEFT) */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-xs border border-line h-fit">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
            <span className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-wood" />
              Filtreler
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-neutral-500 hover:text-wood underline cursor-pointer"
            >
              Temizle
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6 pb-6 border-b border-line">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">Kategoriler</h4>
            <div className="space-y-2">
              {saleCategories.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 text-xs text-neutral-600 hover:text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(c.id)}
                    onChange={() => handleCategoryCheckboxChange(c.id)}
                    className="h-4 w-4 border-line-strong rounded-xs text-wood focus:ring-wood"
                  />
                  <span>{c.name}</span>
                  <span className="ml-auto text-xs font-mono text-neutral-500">{c.count}</span>
                </label>
              ))}
              {saleCategories.length === 0 && (
                <p className="text-xs text-neutral-500">İndirimli ürün bulunan kategori yok.</p>
              )}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6 pb-6 border-b border-line">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">Fiyat Aralığı (TL)</h4>
            <form onSubmit={handlePriceFilterSubmit} className="space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-line p-2 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
                />
                <span className="text-neutral-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-line p-2 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-neutral-100 hover:bg-brand hover:text-ink text-neutral-800 text-xs uppercase font-bold tracking-wider py-2 rounded-xs transition-colors cursor-pointer"
              >
                Uygula
              </button>
            </form>
          </div>

          {/* Discount Rate Filter */}
          <div className="mb-6 pb-6 border-b border-line">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">İndirim Oranı</h4>
            <div className="space-y-2">
              {[
                { label: 'Tüm İndirimler', value: 0 },
                { label: '%15 ve Üzeri', value: 15 },
                { label: '%20 ve Üzeri', value: 20 },
                { label: '%30 ve Üzeri', value: 30 }
              ].map((rate) => (
                <label key={rate.value} className="flex items-center gap-2.5 text-xs text-neutral-600 hover:text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="discount-rate"
                    checked={minDiscount === rate.value}
                    onChange={() => {
                      setMinDiscount(rate.value);
                      setCurrentPage(1);
                    }}
                    className="h-4 w-4 text-wood border-line-strong focus:ring-wood"
                  />
                  <span>{rate.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Only Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">Sadece Stoktakiler</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className="h-4 w-4 text-wood border-line-strong rounded-xs focus:ring-wood"
              />
            </label>
          </div>
        </aside>

        {/* CATALOG AREA (RIGHT) */}
        <main className="lg:col-span-3">
          {/* Header Controls */}
          <div className="bg-white p-4 rounded-xs border border-line flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-semibold text-neutral-800">İndirimli Ürünler</h3>
              <p className="text-xs text-neutral-500 mt-0.5">{totalItems} kampanya ürünü listeleniyor</p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 whitespace-nowrap">Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs border border-line p-2 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-white text-neutral-700 cursor-pointer"
                >
                  <option value="default">Varsayılan</option>
                  <option value="price-asc">Fiyata Göre: Artan</option>
                  <option value="price-desc">Fiyata Göre: Azalan</option>
                  <option value="popular">En Çok Satanlar</option>
                  <option value="discount">İndirim Oranı</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-line rounded-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-neutral-100 text-wood' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                  aria-label="Izgara Görünümü"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l border-line transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-neutral-100 text-wood' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                  aria-label="Liste Görünümü"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Listings */}
          {totalItems === 0 ? (
            <div className="text-center py-20 bg-white border border-line rounded-xs">
              <HelpCircle className="h-12 w-12 text-neutral-300 mx-auto stroke-[1.5] mb-4" />
              <p className="text-neutral-500 text-sm mb-4">Aradığınız kriterlere uygun indirimli ürün bulunamadı.</p>
              <button
                onClick={handleResetFilters}
                className="bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3.5 px-8 transition-colors rounded-xs cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID LAYOUT */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentProducts.map((product, gridIdx) => {
                const discount = getDiscountRate(product.price, product.originalPrice);
                const isFav = favorites.some((fav) => fav.id === product.id);
                return (
                  <div 
                    key={product.id}
                    className="group relative flex flex-col bg-white border border-line rounded-xs overflow-hidden transition-colors duration-200 hover:border-line-strong"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-square bg-paper overflow-hidden cursor-pointer" onClick={() => openQuickView(product)}>
                      <OptimizedImage
                        src={product.image || ''}
                        alt={product.name}
                        fill
                        priority={gridIdx < 3}
                        className="object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-[1.03] will-change-transform"
                      />
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                        <span className="text-xs font-semibold py-1 px-2 bg-signal text-white rounded-xs tabular-nums-all">
                          %{discount} indirim
                        </span>
                        {!product.inStock && (
                          <span className="text-xs font-medium py-1 px-2 bg-ink text-white rounded-xs">
                            Tükendi
                          </span>
                        )}
                      </div>
                      
                      {/* Heart Favorite Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                        }}
                        className={`absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-white border border-line transition-colors cursor-pointer ${
                          isFav ? 'text-signal' : 'text-neutral-500 hover:text-wood'
                        }`}
                        aria-label="Favori"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {/* Action Overlays */}
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-white border-t border-line translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300 ease-out flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickView(product);
                          }}
                          className="flex items-center gap-1.5 border border-line-strong text-ink text-sm font-medium h-10 px-3 rounded-xs transition-colors hover:bg-paper cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detay</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                          className="flex items-center gap-1.5 text-white text-sm font-medium h-10 px-3 rounded-xs transition-colors cursor-pointer bg-ink hover:bg-neutral-800"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>Sepete ekle</span>
                        </button>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-neutral-500 mb-1 block">
                          {typeof product.category === 'object' && product.category ? product.category.name : ''}
                        </span>
                        <h4 
                          onClick={() => openQuickView(product)}
                          className="text-ink text-sm md:text-base font-medium hover:text-wood transition-colors line-clamp-2 cursor-pointer mb-2"
                        >
                          {product.name}
                        </h4>
                      </div>

                      {/* Prices & CTAs */}
                      <div className="mt-2 flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-neutral-500 line-through tabular-nums-all">
                            {formatPrice(product.originalPrice!)}
                          </span>
                          <span className="font-mono text-base font-semibold text-signal tabular-nums-all">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                          className="hidden sm:flex items-center gap-1 border text-sm font-semibold py-2 px-3.5 transition-all duration-300 rounded-xs cursor-pointer border-line text-neutral-700 hover:border-wood hover:bg-brand hover:text-ink"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>Ekle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST LAYOUT */
            <div className="space-y-6">
              {currentProducts.map((product) => {
                const discount = getDiscountRate(product.price, product.originalPrice);
                const isFav = favorites.some((fav) => fav.id === product.id);
                return (
                  <div 
                    key={product.id}
                    className="group relative flex flex-col md:flex-row bg-white border border-line rounded-xs overflow-hidden transition-[box-shadow,border-color] duration-300 hover:shadow-xl hover:border-line-strong"
                  >
                    {/* Left Column: Image Box */}
                    <div className="relative w-full md:w-64 xl:w-72 aspect-[4/3] md:aspect-auto bg-neutral-50 flex-shrink-0 cursor-pointer overflow-hidden min-h-[200px]" onClick={() => openQuickView(product)}>
                      <OptimizedImage
                        src={product.image || ''}
                        alt={product.name}
                        fill
                        className="object-cover transform-gpu transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                      />
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                        <span className="text-xs font-semibold py-1 px-2 bg-signal text-white rounded-xs">
                          %{discount} İndirim
                        </span>
                        {!product.inStock && (
                          <span className="text-xs font-medium py-1 px-2 bg-ink text-white rounded-xs">
                            Tükendi
                          </span>
                        )}
                      </div>
                      
                      {/* Heart Favorite Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product);
                        }}
                        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 border border-line transition-all duration-300 cursor-pointer ${
                          isFav ? 'text-signal' : 'text-neutral-500 hover:text-wood'
                        }`}
                        aria-label="Favori"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Right Column: Specifications */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                              {product.category === 'living-room' && 'Oturma Odası'}
                              {product.category === 'bedroom' && 'Yatak Odası'}
                              {product.category === 'dining' && 'Yemek Odası'}
                              {product.category === 'accessories' && 'Aksesuar'}
                            </span>
                            <h4 
                              onClick={() => openQuickView(product)}
                              className="text-neutral-800 text-base md:text-lg font-normal tracking-wide hover:text-wood transition-colors duration-300 cursor-pointer"
                            >
                              {product.name}
                            </h4>
                          </div>


                        </div>

                        {/* Description Text */}
                        <p className="text-xs text-neutral-500 leading-relaxed mb-4 max-w-2xl">
                          {product.description}
                        </p>

                        {/* Material Specs */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-neutral-500 mb-4">
                          {product.material && <span><strong>Malzeme:</strong> {product.material}</span>}
                          {product.dimensions && <span><strong>Boyutlar:</strong> {product.dimensions}</span>}
                        </div>
                      </div>

                      {/* Footer Actions / Price row */}
                      <div className="border-t border-line pt-4 flex items-center justify-between gap-4">
                        <div className="flex items-end gap-3">
                          <span className="text-xs text-neutral-500 line-through tabular-nums-all">
                            {formatPrice(product.originalPrice!)}
                          </span>
                          <span className="text-lg font-bold tracking-wider text-signal">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-ok bg-ok-soft px-2 py-0.5 rounded-xs font-semibold">
                            Tasarruf: {formatPrice(product.originalPrice! - product.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openQuickView(product)}
                            className="flex items-center gap-1.5 border border-line text-neutral-700 hover:text-ink hover:border-ink text-sm font-semibold py-2.5 px-4 transition-all duration-300 rounded-xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Hızlı Bakış</span>
                          </button>
                          <button
                            onClick={() => {
                              if (product.inStock) addToCart(product, 1);
                            }}
                            disabled={!product.inStock}
                            className={`flex items-center gap-1.5 text-white text-sm font-semibold py-2.5 px-5 transition-all duration-300 rounded-xs cursor-pointer ${
                              product.inStock 
                                ? 'bg-ink hover:bg-neutral-800' 
                                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                            }`}
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>{product.inStock ? 'Sepete Ekle' : 'Stok Dışı'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xs border border-line flex items-center justify-center transition-all ${
                  currentPage === 1 
                    ? 'text-neutral-300 bg-white cursor-not-allowed' 
                    : 'text-neutral-600 hover:bg-neutral-100 bg-white hover:text-ink cursor-pointer'
                }`}
                aria-label="Önceki Sayfa"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 rounded-xs border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-ink border-wood text-white' 
                        : 'border-line bg-white text-neutral-600 hover:bg-neutral-100 hover:text-ink'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xs border border-line flex items-center justify-center transition-all ${
                  currentPage === totalPages 
                    ? 'text-neutral-300 bg-white cursor-not-allowed' 
                    : 'text-neutral-600 hover:bg-neutral-100 bg-white hover:text-ink cursor-pointer'
                }`}
                aria-label="Sonraki Sayfa"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SalePage;
