'use client';

import { ORDERS_PAUSED } from '../lib/storeStatus';
import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useCartStore } from '../stores/useCartStore';
import type { ProductImages } from '../types';
import { useWhatsappNumber } from '../lib/whatsapp';
import { useModalDismiss } from '../lib/useModalDismiss';
import EdgeNav from './EdgeNav';

export const ProductQuickView: React.FC = () => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const product = useUIStore((state) => state.selectedQuickViewProduct);
  const onClose = useUIStore((state) => state.closeQuickView);

  const isFavorite = useFavoritesStore((state) => (product ? state.isFavorite(product.id) : false));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const addToCart = useCartStore((state) => state.addToCart);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reset indices when active product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
  }, [product]);

  useModalDismiss(!!product, onClose);

  if (!product) return null;

  const getQuickViewImages = (): string[] => {
    if (product.images && typeof product.images === 'object' && 'gallery' in product.images) {
      const pImgs = product.images as ProductImages;
      return [pImgs.main, ...(pImgs.gallery || [])];
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [product.image];
  };

  const productImagesList = getQuickViewImages();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  const isDiscounted = !!product.originalPrice && Number(product.originalPrice) > Number(product.price);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-xs overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row transition-all duration-500 transform animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-500 hover:text-neutral-900 bg-white/95 rounded-full border border-line duration-300 cursor-pointer"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 bg-neutral-50/50">
          <div className="aspect-square w-full rounded-xs overflow-hidden bg-neutral-100 relative">
            <img
              src={productImagesList[activeImageIndex] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <EdgeNav
              enabled={productImagesList.length > 1}
              onPrev={() => setActiveImageIndex((i) => (i - 1 + productImagesList.length) % productImagesList.length)}
              onNext={() => setActiveImageIndex((i) => (i + 1) % productImagesList.length)}
            />
            {product.badge && (
              <span className="absolute top-4 left-4 z-30 pointer-events-none bg-ink text-white text-sm font-semibold py-1 px-3 rounded-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails grid */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {productImagesList.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`w-20 aspect-square rounded-xs overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                  index === activeImageIndex 
                    ? 'border-wood scale-95' 
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`${product.name} Görsel ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Content Detail */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[45vh] md:max-h-[90vh]">
          {/* Header metadata */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-wood uppercase tracking-wider block mb-1">
              {(() => {
                const catObj = typeof product.category === 'object' && product.category !== null ? product.category as { name?: string; slug?: string } : null;
                const catSlug = catObj?.slug || (typeof product.category === 'string' ? product.category : '');
                return catObj?.name || catSlug || 'UBEI';
              })()}
            </span>
            <h3 className="text-xl md:text-2xl text-neutral-900 tracking-tight">
              {product.name}
            </h3>
          </div>

          {/* Craftsmanship & Origin Badge */}
          <div className="flex items-center gap-2 mb-4 border-b border-line pb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-semibold bg-wood/10 text-wood border border-wood/20">
              {product.stock && product.stock > 0 ? 'Stokta' : 'Tedarikte'}
            </span>
            <span className="text-neutral-300">|</span>
            <span className="text-xs text-neutral-500 font-normal">{ORDERS_PAUSED ? 'Sipariş alımı geçici olarak kapalı' : '15:00’e kadar aynı gün kargo'}</span>
          </div>

          {/* Prices */}
          <div className="mb-6">
            {isDiscounted && (
              <span className="text-sm text-neutral-500 line-through tracking-wider block">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <span className={`text-2xl font-semibold tracking-wider ${
              isDiscounted ? 'text-signal' : 'text-neutral-900'
            }`}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Short description */}
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Key Specs */}
          <div className="bg-paper p-4 rounded-xs border border-line flex flex-col gap-2 mb-4 text-xs">
            {product.material && (
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="font-semibold text-neutral-700">Malzeme:</span>
                <span className="text-neutral-900 font-medium text-right">{product.material}</span>
              </div>
            )}
            {(product.widthCm || product.heightCm || product.depthCm) ? (
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="font-semibold text-neutral-700">Ölçüler (G × D × Y):</span>
                <span className="text-neutral-900 font-medium text-right">
                  {product.widthCm ? `${product.widthCm} cm (G)` : ''}
                  {product.depthCm ? ` × ${product.depthCm} cm (D)` : ''}
                  {product.heightCm ? ` × ${product.heightCm} cm (Y)` : ''}
                </span>
              </div>
            ) : product.dimensions ? (
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="font-semibold text-neutral-700">Boyutlar:</span>
                <span className="text-neutral-900 font-medium text-right">{product.dimensions}</span>
              </div>
            ) : null}

            {product.drawerCount !== undefined && product.drawerCount > 0 && (
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="font-semibold text-neutral-700">Adet:</span>
                <span className="text-neutral-900 font-semibold text-right">{product.drawerCount}</span>
              </div>
            )}

            {product.unitCount !== undefined && product.unitCount > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-neutral-700">Parça:</span>
                <span className="text-neutral-900 font-semibold text-right">{product.unitCount} parça</span>
              </div>
            )}
          </div>

          {/* Color options if available */}
          {((product.colorOptions && product.colorOptions.length > 0) || (product.colors && product.colors.length > 0)) && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-neutral-800 block mb-1.5">Mevcut Renk Opsiyonları:</span>
              <div className="flex flex-wrap gap-1.5">
                {(product.colorOptions || product.colors || []).map((c, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-neutral-100 border border-line text-neutral-800 rounded-xs font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features bullet list */}
          <div className="mb-6">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">Öne Çıkan Özellikler</h5>
            <ul className="text-neutral-600 text-xs font-normal space-y-1.5 list-disc pl-4">
              {product.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Quantity and CTA Buttons */}
          <div className="mt-auto border-t border-line pt-5">
            <div className="flex items-center gap-3 mb-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-line-strong rounded-xs bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-bold"
                  aria-label="Miktarı azalt"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold text-neutral-900 w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer text-sm font-bold"
                  aria-label="Miktarı arttır"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs md:text-sm font-semibold py-3.5 px-4 transition-all duration-200 rounded-xs cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Sepete Ekle</span>
              </button>

              {/* Favorite toggle */}
              <button
                onClick={() => toggleFavorite(product)}
                className={`p-3 border rounded-xs transition-all duration-200 cursor-pointer ${
                  isFavorite 
                    ? 'border-signal/40 text-signal bg-signal/5' 
                    : 'border-line text-neutral-500 hover:text-neutral-900 hover:border-neutral-400'
                }`}
                aria-label="Favorilere Ekle/Çıkar"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* WhatsApp Direct Order CTA */}
            <a
              hidden={!waNumber} href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Merhaba UBEI, "${product.name}" (${formatPrice(product.price)}) ürününüz için WhatsApp üzerinden doğrudan sipariş vermek ve teslimat durumunu öğrenmek istiyorum.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-whatsapp hover:bg-whatsapp-dark text-white text-xs md:text-sm font-bold py-3 px-4 rounded-xs transition-all duration-200 mb-4 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>WhatsApp ile Hızlı Sipariş / Pazarlık</span>
            </a>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 font-medium text-center">
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded border border-line">
                <Truck className="h-4 w-4 text-wood-dark" />
                <span>Aynı gün kargo</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded border border-line">
                <ShieldCheck className="h-4 w-4 text-wood-dark" />
                <span>2 yıl garanti</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-neutral-50 rounded border border-line">
                <RefreshCw className="h-4 w-4 text-wood-dark" />
                <span>14 gün iade</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
