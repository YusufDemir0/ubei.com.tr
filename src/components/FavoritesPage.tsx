'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useCartStore } from '../stores/useCartStore';
import { useUIStore } from '../stores/useUIStore';

export const FavoritesPage: React.FC = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const addToCart = useCartStore((state) => state.addToCart);
  const openQuickView = useUIStore((state) => state.openQuickView);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  return (
    <div className="w-full bg-canvas min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-500 flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-wood transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">Favorilerim</span>
        </nav>

        <h2 className="text-2xl md:text-3xl text-ink mb-10">
          Beğendiğim Tasarımlar
        </h2>

        {!isMounted ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-wood mb-3"></div>
            <p className="text-xs text-neutral-500">Favorileriniz yükleniyor...</p>
          </div>
        ) : favorites.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="text-center py-20 bg-white border border-line rounded-xs max-w-xl mx-auto">
            <Heart className="h-16 w-16 text-neutral-300 stroke-[1.5] mx-auto mb-6" />
            <h3 className="text-lg font-normal text-neutral-800 mb-2">Favori Ürününüz Yok</h3>
            <p className="text-neutral-500 text-sm mb-8 px-6">
              Beğendiğiniz ürünleri ürün kartlarının sağ üst köşesinde yer alan kalp simgesine tıklayarak buraya ekleyebilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-block bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-4 px-8 rounded-xs transition-colors duration-300 cursor-pointer"
            >
              Koleksiyonları Keşfet
            </Link>
          </div>
        ) : (
          /* --- FAVORITES GRID --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {favorites.map((product) => {
              const discount = product.originalPrice 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                : 0;

              return (
                <div 
                  key={product.id}
                  className="group relative flex flex-col bg-white border border-line rounded-xs overflow-hidden transition-colors duration-200 hover:border-line-strong"
                >
                  {/* Image and Badges */}
                  <div className="relative aspect-square bg-paper overflow-hidden cursor-pointer" onClick={() => openQuickView(product)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {discount > 0 && (
                        <span className="text-xs font-semibold py-1 px-2 bg-signal text-white rounded-xs tabular-nums-all">
                          %{discount} indirim
                        </span>
                      )}
                      {product.badge && discount === 0 && (
                        <span className="text-xs font-medium py-1 px-2 bg-white text-ink border border-line rounded-xs">
                          {product.badge}
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="text-xs font-medium py-1 px-2 bg-ink text-white rounded-xs">
                          Tükendi
                        </span>
                      )}
                    </div>

                    {/* Heart Button to remove */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(product.id);
                      }}
                      className="absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-white border border-line transition-colors text-signal cursor-pointer"
                      aria-label="Favorilerden çıkar"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>

                    {/* Hover actions */}
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
                          removeFavorite(product.id);
                        }}
                        className="flex items-center gap-1.5 text-white text-sm font-medium h-10 px-3 rounded-xs transition-colors cursor-pointer bg-ink hover:bg-neutral-800"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Sepete ekle</span>
                      </button>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-neutral-500 mb-1 block">
                        {(() => {
                          const catObj = typeof product.category === 'object' && product.category !== null ? product.category as { name?: string; slug?: string } : null;
                          const catSlug = catObj?.slug || (typeof product.category === 'string' ? product.category : '');
                          return catObj?.name || catSlug || 'UBEI';
                        })()}
                      </span>
                      <h4 
                        onClick={() => openQuickView(product)}
                        className="text-ink text-sm md:text-base font-medium hover:text-wood transition-colors line-clamp-2 cursor-pointer mb-2"
                      >
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <div className="flex flex-col">
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-500 line-through tabular-nums-all">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        <span className={`font-mono text-base font-semibold tabular-nums-all ${
                          product.originalPrice ? 'text-signal' : 'text-ink'
                        }`}>
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                          removeFavorite(product.id);
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
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
