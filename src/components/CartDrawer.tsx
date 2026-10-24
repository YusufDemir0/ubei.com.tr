'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useCartStore } from '../stores/useCartStore';
import { OptimizedImage } from './OptimizedImage';
import { useWhatsappNumber } from '../lib/whatsapp';
import LeadTimeBadge from './LeadTimeBadge';
import { useModalDismiss } from '../lib/useModalDismiss';

export const CartDrawer: React.FC = () => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const isOpen = useUIStore((state) => state.isCartOpen);
  const onClose = useUIStore((state) => state.closeCart);

  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  useModalDismiss(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-ink/50 animate-fade-in" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white flex flex-col shadow-2xl animate-drawer-right">
          {/* Header */}
          <div className="px-4 sm:px-6 py-6 border-b border-line flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Sepetim</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Online ödeme alınmaz; talebinizi temsilcimiz netleştirir.</p>
            </div>
            <button
              onClick={onClose}
              className="h-11 w-11 -mr-2 flex items-center justify-center text-neutral-500 hover:text-ink cursor-pointer"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-12 w-12 text-neutral-300 stroke-[1.5] mb-4" />
                <p className="text-neutral-600 text-sm mb-6">
                  Sepetiniz boş.
                </p>
                {/* Ürünler sayfasına gider; yalnız çekmeceyi kapatmak ana sayfadaysa hiçbir yere götürmüyordu */}
                <Link
                  href="/kategori"
                  onClick={onClose}
                  className="bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-6 rounded-xs transition-colors cursor-pointer"
                >
                  Ürünleri gör
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const itemKey = item.itemKey || item.product.id;
                  return (
                    <div 
                      key={itemKey} 
                      className="flex gap-4 border-b border-line pb-5 items-start"
                    >
                      {/* Item Image */}
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xs bg-neutral-50 border border-line">
                        <OptimizedImage
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-neutral-900">
                            <h3 className="line-clamp-2 font-medium text-ink">
                              {item.product.name}
                            </h3>
                            <p className="ml-4 font-mono font-semibold tabular-nums-all whitespace-nowrap">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                          {item.product.selectedColor && (
                            <div className="mt-1">
                              <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-xs">
                                Renk: {item.product.selectedColor}
                              </span>
                            </div>
                          )}
                          {item.product.selectedPieces && item.product.selectedPieces.length > 0 && (
                            <div className="mt-1">
                              <span className="text-xs text-neutral-700 bg-paper border border-line px-2 py-0.5 rounded-xs block line-clamp-2">
                                Parçalar: {item.product.selectedPieces.join(', ')}
                              </span>
                            </div>
                          )}
                          <p className="mt-1 text-xs text-neutral-500 capitalize">
                            {item.product.material}
                          </p>

                          <div className="mt-1.5">
                            <LeadTimeBadge product={item.product} />
                          </div>
                        </div>

                        {/* Quantity Controls and Trash Button */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-line-strong rounded-xs">
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

                          <button
                            onClick={() => removeItem(itemKey)}
                            className="h-11 w-11 flex items-center justify-center text-neutral-500 hover:text-signal transition-colors cursor-pointer"
                            aria-label="Ürünü çıkar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Calculations */}
          {cartItems.length > 0 && (
            <div className="border-t border-line py-5 px-4 sm:px-6 bg-paper">
              <div className="space-y-1.5 mb-6">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Ara toplam</span>
                  <span className="font-mono tabular-nums-all">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>KDV (%20)</span>
                  <span>Dahil</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-ink pt-2 border-t border-line">
                  <span>Tahmini tutar</span>
                  <span className="font-mono tabular-nums-all">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                id="checkout-btn"
                href="/talep"
                onClick={onClose}
                className="w-full h-12 flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold transition-colors rounded-xs cursor-pointer"
              >
                <span>Siparişi tamamla</span>
                <ArrowRight className="h-4 w-4" />
              </Link>


              <div className="mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-neutral-600 hover:text-ink transition-colors cursor-pointer py-2"
                >
                  Ürünlere dön
                </button>
                <a
                  hidden={!waNumber} href={`https://wa.me/${waNumber}?text=Merhaba%20UBEI%2C%20i%C5%9Fyerimiz%20i%C3%A7in%20toplu%20aksesuar%20almak%20istiyoruz.%20Adetli%20fiyat%20alabilir%20miyiz%3F`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wood underline underline-offset-2 hover:text-wood-dark py-2"
                >
                  Toplu alım fiyatı isteyin
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
