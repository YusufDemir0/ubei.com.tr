'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product, ProductImages } from '../types';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { toast } from '../stores/useToastStore';
import { useWhatsappNumber } from '../lib/whatsapp';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToCart?: () => void;
  /** Liste sayfalarında ürüne özel WhatsApp sorusu için küçük bağlantı */
  showWhatsapp?: boolean;
  /** Ekranın üstündeki ilk kartlar: görsel öncelikli yüklenir (LCP) */
  priority?: boolean;
}

// Module-level cached formatter to avoid expensive re-allocations on render cycles
const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

const formatPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num) || num === undefined || num === null) return '0 TL';
  return currencyFormatter.format(num).replace('TRY', 'TL');
};

const getCoverImage = (product: Product): string => {
  if (product.images && typeof product.images === 'object' && 'main' in product.images) {
    return (product.images as ProductImages).main || product.image || '';
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0] || product.image || '';
  }
  return product.image1 || product.image || '';
};

const getCategoryLabel = (category: Product['category']): string => {
  const catObj = typeof category === 'object' && category !== null ? (category as { name?: string; slug?: string }) : null;
  if (catObj?.name) return catObj.name;
  const catSlug = catObj?.slug || (typeof category === 'string' ? category : '');
  return catSlug || 'UBEI';
};

export const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  isFavorite: isFavoriteProp,
  onToggleFavorite: onToggleFavoriteProp,
  onAddToCart: onAddToCartProp,
  showWhatsapp = false,
  priority = false,
}) => {
  const waNumber = useWhatsappNumber();
  const storeIsFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const storeToggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const storeAddToCart = useCartStore((state) => state.addToCart);

  const isFav = isFavoriteProp !== undefined ? isFavoriteProp : storeIsFavorite;

  const handleToggleFavorite = () => {
    if (onToggleFavoriteProp) {
      onToggleFavoriteProp();
    } else {
      storeToggleFavorite(product);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCartProp) {
      onAddToCartProp();
    } else {
      storeAddToCart(product, 1);
      toast.success('Sepete eklendi', product.name);
    }
  };

  const isDiscounted = !!product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const mainImage = getCoverImage(product);
  const categoryLabel = getCategoryLabel(product.category);

  return (
    <article className="group relative flex flex-col bg-white border border-line rounded-xs overflow-hidden transition-colors duration-200 hover:border-line-strong">
      {/* Görsel */}
      <Link href={`/urun/${product.slug || product.id}`} className="relative aspect-square bg-paper overflow-hidden block">
        {/* Kapak görseli: üzerine gelince hafif yakınlaşma (ikinci görsele geçiş yok) */}
        <OptimizedImage
          src={mainImage}
          alt={product.name}
          fill
          priority={priority}
          className="object-cover transform-gpu transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.04]"
        />

        {/* Yalnız ürüne özgü rozet (CMS'ten gelen); her karta basılan sabit rozet yok */}
        {(product.badge || isDiscounted) && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col items-start gap-1">
            {product.badge && (
              <span className="text-xs font-medium py-1 px-2 rounded-xs bg-white text-ink border border-line">{product.badge}</span>
            )}
            {isDiscounted && (
              <span className="text-xs font-semibold py-1 px-2 rounded-xs bg-signal text-white tabular-nums-all">
                %{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)} indirim
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Favori: görselin üstünde, link dışında */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-white border border-line transition-colors cursor-pointer ${
          isFav ? 'text-signal' : 'text-neutral-600 hover:text-wood'
        }`}
        aria-label={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        aria-pressed={isFav}
      >
        <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
      </button>

      {/* Künye */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="space-y-1">
          <span className="text-xs text-neutral-500 block">{categoryLabel}</span>
          <Link
            href={`/urun/${product.slug || product.id}`}
            className="text-ink text-sm md:text-base font-medium leading-snug hover:text-wood transition-colors line-clamp-2 block"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="flex flex-col">
            {isDiscounted && (
              <span className="text-xs text-neutral-500 line-through tabular-nums-all">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <span className={`font-mono text-base font-semibold tabular-nums-all ${isDiscounted ? 'text-signal' : 'text-ink'}`}>
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="flex items-center justify-center gap-1.5 h-10 min-w-10 px-3 border border-line-strong text-ink hover:bg-ink hover:border-ink hover:text-white text-sm font-medium rounded-xs transition-colors cursor-pointer"
            aria-label={`${product.name} sepete ekle`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden md:inline">Sepete ekle</span>
          </button>
        </div>

        {showWhatsapp && (
          <a
            hidden={!waNumber} href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Merhaba UBEI, "${product.name}" hakkında fiyat ve teslimat bilgisi almak istiyorum.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-whatsapp hover:text-whatsapp-dark underline-offset-2 hover:underline self-start"
          >
            WhatsApp’tan sorun
          </a>
        )}
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
