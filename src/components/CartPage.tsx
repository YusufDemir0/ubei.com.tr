'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import LeadTimeBadge from './LeadTimeBadge';
import { useCartStore } from '../stores/useCartStore';
import { useWhatsappNumber } from '../lib/whatsapp';

export const CartPage: React.FC = () => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price).replace('TRY', 'TL');
  };

  return (
    <div className="w-full bg-canvas min-h-screen py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-500 flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-wood transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-700">Sepetim</span>
        </nav>

        <div className="border-b border-line pb-5 mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink">Sepetim</h1>
          <p className="text-sm text-neutral-600 mt-1">Online ödeme alınmaz. Talebinizi gönderdikten sonra temsilcimiz teslimat ve ödemeyi sizinle netleştirir.</p>
        </div>

        {!isMounted ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-wood mb-3"></div>
            <p className="text-xs text-neutral-500">Sepetiniz yükleniyor...</p>
          </div>
        ) : cartItems.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="text-center py-20 bg-white border border-line rounded-xs max-w-xl mx-auto">
            <ShoppingBag className="h-16 w-16 text-neutral-300 stroke-[1.5] mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-ink mb-2">Sepetiniz boş</h3>
            <p className="text-neutral-500 text-sm mb-8 px-6">
              Ürünlere göz atıp beğendiklerinizi sepete ekleyebilirsiniz.
            </p>
            <Link
              href="/kategori"
              className="inline-block bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-6 rounded-xs transition-colors cursor-pointer"
            >
              Ürünleri gör
            </Link>
          </div>
        ) : (
          /* --- CART LAYOUT --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 bg-white rounded-xs border border-line p-6 space-y-6">
              <div className="hidden sm:grid grid-cols-12 text-xs font-medium text-neutral-500 border-b border-line pb-3">
                <span className="col-span-6">Ürün</span>
                <span className="col-span-2 text-center">Birim fiyat</span>
                <span className="col-span-2 text-center">Adet</span>
                <span className="col-span-2 text-right">Toplam</span>
              </div>

              {cartItems.map((item) => {
                const itemKey = item.itemKey || item.product.id;
                return (
                  <div 
                    key={itemKey}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border-b border-line pb-6 last:border-0 last:pb-0"
                  >
                    {/* Image and Name */}
                    <div className="col-span-1 sm:col-span-6 flex gap-4 items-center">
                      <div className="h-24 w-20 flex-shrink-0 rounded-xs overflow-hidden bg-neutral-50 border border-line">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-ink text-sm font-medium">
                          {item.product.name}
                        </h4>
                        {item.product.selectedColor && (
                          <p className="mt-1 text-xs">
                            <span className="inline-block bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-xs font-medium">
                              Renk: {item.product.selectedColor}
                            </span>
                          </p>
                        )}
                        {item.product.selectedPieces && item.product.selectedPieces.length > 0 && (
                          <p className="mt-1 text-xs">
                            <span className="inline-block bg-paper text-neutral-800 border border-line px-2 py-0.5 rounded-xs">
                              Parçalar: {item.product.selectedPieces.join(', ')}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1 capitalize">
                          {item.product.material}
                        </p>

                        <div className="mt-2">
                          <LeadTimeBadge product={item.product} />
                        </div>

                        <button
                          onClick={() => removeItem(itemKey)}
                          className="text-sm text-neutral-500 hover:text-signal transition-colors flex items-center gap-1 mt-1 py-2 cursor-pointer"
                          aria-label="Ürünü kaldır"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Kaldır</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="col-span-1 sm:col-span-2 text-left sm:text-center">
                      <span className="sm:hidden text-xs text-neutral-500 mr-2">Birim Fiyat:</span>
                      <span className="text-sm text-neutral-800 font-mono tabular-nums-all">
                        {formatPrice(item.product.price)}
                      </span>
                    </div>

                    {/* Quantity adjust */}
                    <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                      <div className="flex items-center border border-line-strong rounded-xs bg-white">
                        <button
                          onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                          className="h-11 w-11 flex items-center justify-center hover:bg-paper text-neutral-700 transition-colors cursor-pointer"
                          aria-label="Adedi azalt"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-mono text-ink w-8 text-center tabular-nums-all" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                          className="h-11 w-11 flex items-center justify-center hover:bg-paper text-neutral-700 transition-colors cursor-pointer"
                          aria-label="Adedi artır"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Multiply total */}
                    <div className="col-span-1 sm:col-span-2 text-left sm:text-right">
                      <span className="sm:hidden text-xs text-neutral-500 mr-2">Toplam:</span>
                      <span className="text-sm text-ink font-mono font-semibold tabular-nums-all">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sağ kolon: talep özeti */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-paper border border-line rounded-xs p-6">
                <h2 className="text-base font-semibold text-ink border-b border-line pb-3 mb-4">Sipariş özeti</h2>

                <dl className="space-y-2.5 text-sm text-neutral-600 border-b border-line pb-4 mb-4">
                  <div className="flex justify-between">
                    <dt>Ara toplam</dt>
                    <dd className="text-ink font-mono tabular-nums-all">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>KDV (%20)</dt>
                    <dd className="text-ink">Dahil</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Kargo</dt>
                    <dd className="text-ink">{subtotal >= 1000 ? 'Ücretsiz' : formatPrice(79)}</dd>
                  </div>
                </dl>

                <div className="flex justify-between items-baseline mb-5">
                  <span className="text-base font-semibold text-ink">Toplam</span>
                  <span className="font-mono text-xl font-semibold text-ink tabular-nums-all">{formatPrice(subtotal >= 1000 ? subtotal : subtotal + 79)}</span>
                </div>

                <Link
                  href="/talep"
                  className="w-full h-12 flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold transition-colors rounded-xs cursor-pointer"
                >
                  <span>Siparişi tamamla</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="text-xs text-neutral-600 mt-4 leading-relaxed">
                  1.000 TL ve üzeri siparişlerde kargo ücretsiz. 10 adet ve üzeri alım için{' '}
                  <a
                    hidden={!waNumber} href={`https://wa.me/${waNumber}?text=Merhaba%20UBEI%2C%20i%C5%9Fyerimiz%20i%C3%A7in%20toplu%20aksesuar%20almak%20istiyoruz.%20Adetli%20fiyat%20alabilir%20miyiz%3F`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wood underline underline-offset-2 hover:text-wood-dark"
                  >
                    adetli fiyat isteyin
                  </a>
                  .
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
