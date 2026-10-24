'use client';

import React, { useState, useEffect, use, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, Star, 
  CheckCircle2, ArrowLeft, Layers, Ruler, Loader2, Compass, 
  Eye, Check, MessageSquare, CreditCard, Box,
  Info, CornerDownRight, Send, CheckCircle, Award, Factory,
  Tag, PlusCircle, Percent, CheckSquare, Square
} from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { productService } from '../services/productService';
import apiClient from '../services/api';
import { getProductImages } from '../lib/productImages';
import type { Product, ProductColorVariant, ProductSetPiece } from '../types';
import ProductCard from './ProductCard';
import LeadTimeBadge from './LeadTimeBadge';
import EdgeNav from './EdgeNav';
import { toast } from '../stores/useToastStore';
import { useWhatsappNumber } from '../lib/whatsapp';

interface ProductDetailClientProps {
  id: string;
  initialProduct?: Product | null;
}

export interface LuxurySwatch extends ProductColorVariant {
  category: 'renk';
  categoryLabel: string;
  description: string;
}

// Renk adını renk örneğine çevirir. Ürünün rengi girilmemişse sayfada renk seçimi gösterilmez.
const COLOR_HEX_MAP: Array<[string, string]> = [
  ['şeffaf', '#E8EEF4'],
  ['gece mavisi', '#24365C'],
  ['gece grisi', '#3A434D'],
  ['lacivert', '#2B3A6B'],
  ['adaçayı', '#8DA58A'],
  ['haki', '#4F6B4A'],
  ['taba', '#9A5A2C'],
  ['kiremit', '#C46A4A'],
  ['beyaz', '#F4F6F8'],
  ['siyah', '#1D232B'],
];

export function resolveSwatchForColor(col: string | ProductColorVariant, idx = 0): LuxurySwatch {
  const name = typeof col === 'object' && col !== null ? col.name || 'Renk' : String(col || '').trim() || 'Renk';
  const lower = name.toLocaleLowerCase('tr-TR');
  const explicit = typeof col === 'object' && col !== null ? col.hex || col.color : undefined;
  const hex = explicit || COLOR_HEX_MAP.find(([key]) => lower.includes(key))?.[1] || '#6B7280';
  return {
    id: (typeof col === 'object' && col?.id) || `renk-${idx}-${lower.replace(/\s+/g, '-')}`,
    name,
    color: hex,
    hex,
    image: typeof col === 'object' && col !== null ? col.image : undefined,
    tag: 'Renk',
    category: 'renk',
    categoryLabel: 'Renk',
    description: name,
  };
}

// Module-level cached price formatter
const detailCurrencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

export default function ProductDetailClient({ id, initialProduct }: ProductDetailClientProps) {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const router = useRouter();
  const storeProducts = useCMSStore((state) => state.products);
  const contactInfo = useCMSStore((state) => state.contactInfo);
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));

  const [product, setProduct] = useState<Product | null>(() => {
    return initialProduct || storeProducts.find((p) => p.id === id || p.slug === id) || null;
  });
  const [loading, setLoading] = useState(!initialProduct && !product);
  const [notFoundState, setNotFoundState] = useState(!initialProduct && !product && initialProduct === null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSwatch, setSelectedSwatch] = useState<ProductColorVariant | null>(() => {
    const rawColors = initialProduct?.colors;
    return rawColors && rawColors.length > 0 ? resolveSwatchForColor(rawColors[0], 0) : null;
  });
  const [quantity, setQuantity] = useState(1);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);
  // Mobilde ana butonlar ekrandan çıkınca alttaki sabit satın alma çubuğu görünür
  // Callback ref: ürün sonradan yüklendiğinde de gözlemci bağlansın
  const [actionsEl, setActionsEl] = useState<HTMLDivElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const el = actionsEl;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [actionsEl]);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');
  const [selectedComplementaryIds, setSelectedComplementaryIds] = useState<string[]>([]);
  const [selectedSetPieceTitles, setSelectedSetPieceTitles] = useState<string[]>([]);

  // Synchronize modular set pieces when product loads or updates
  useEffect(() => {
    if (product?.setPieces && product.setPieces.length > 0) {
      setSelectedSetPieceTitles(product.setPieces.map((p) => p.title));
    } else {
      setSelectedSetPieceTitles([]);
    }
  }, [product?.id]);

  const toggleSetPiece = (title: string) => {
    setSelectedSetPieceTitles((prev) => {
      if (prev.includes(title)) {
        if (prev.length <= 1) return prev; // At least one piece remains in set
        return prev.filter((t) => t !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  // Hover Lens Zoom States - zero-re-render RAF DOM mutation for 60-120 FPS
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !zoomImageRef.current) return;
    // Kenar geçiş alanındayken büyüteç kapalı; ortaya dönünce yeniden açılır
    const onEdge = (e.target as HTMLElement).closest('[data-edge-nav]');
    if (onEdge) {
      if (isZoomed) setIsZoomed(false);
      return;
    }
    if (!isZoomed) setIsZoomed(true);
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      if (zoomImageRef.current) {
        zoomImageRef.current.style.transformOrigin = `${x}% ${y}%`;
      }
    });
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    if (zoomImageRef.current) {
      zoomImageRef.current.style.transformOrigin = 'center center';
    }
  };

  // Resilient async load from REST API if not found in store or initial props immediately
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      if (initialProduct.colors && initialProduct.colors.length > 0) {
        setSelectedSwatch(resolveSwatchForColor(initialProduct.colors[0], 0));
      }
      setLoading(false);
      return;
    }

    let isMounted = true;
    const storeItem = storeProducts.find((p) => p.id === id || p.slug === id);
    if (storeItem) {
      setProduct(storeItem);
      if (storeItem.colors && storeItem.colors.length > 0) {
        setSelectedSwatch(resolveSwatchForColor(storeItem.colors[0], 0));
      }
      setLoading(false);
      return;
    }

    async function loadProduct() {
      try {
        const fetched = await productService.getProductById(id);
        if (isMounted) {
          if (fetched) {
            setProduct(fetched);
            if (fetched.colors && fetched.colors.length > 0) {
              setSelectedSwatch(resolveSwatchForColor(fetched.colors[0], 0));
            }
          } else {
            setNotFoundState(true);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setNotFoundState(true);
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, storeProducts]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] bg-paper flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-wood animate-spin" />
        <span className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">
          Ürün Tasarımı Yükleniyor...
        </span>
      </div>
    );
  }

  if (notFoundState || !product) {
    return (
      <div className="w-full min-h-[60vh] bg-paper flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-6 bg-white border border-line text-neutral-800 rounded-xs max-w-md space-y-4">
          <h2 className="font-display text-xl font-bold tracking-tight">Koleksiyon Bulunamadı</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Aradığınız ürün satıştan kaldırılmış ya da geçici olarak yayında değil.
          </p>
          <Link
            href="/kategori"
            className="inline-block bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-6 rounded-xs transition-colors"
          >
            2026 Kataloğuna Dön
          </Link>
        </div>
      </div>
    );
  }

  const imagesList = getProductImages(product);
  const currentImage = imagesList[selectedImageIndex] || imagesList[0];

  const productColors: LuxurySwatch[] = useMemo(() => {
    // Yalnız admin'in girdiği renkler; girilmediyse ürün yalın listelenir (uydurma kartela yok)
    return (product.colors || []).map((c, idx) => resolveSwatchForColor(c, idx));
  }, [product.colors]);
  const hasColors = productColors.length > 0;

  useEffect(() => {
    if (!hasColors) {
      if (selectedSwatch) setSelectedSwatch(null);
      return;
    }
    const exists = selectedSwatch && productColors.some((s) => s.name === selectedSwatch.name || s.id === selectedSwatch.id);
    if (!exists) setSelectedSwatch(productColors[0]);
  }, [productColors, selectedSwatch, hasColors]);

  const displayedSwatches = productColors;

  const handleSelectColor = (swatch: ProductColorVariant) => {
    setSelectedSwatch(swatch);
    if (swatch.image) {
      const foundIdx = imagesList.findIndex(img => img === swatch.image);
      if (foundIdx !== -1) {
        setSelectedImageIndex(foundIdx);
      }
    }
  };

  const handleAddToCartClick = () => {
    const customizedProduct = {
      ...product,
      selectedColor: selectedSwatch?.name,
      selectedVariant: selectedSwatch ? selectedSwatch.id || selectedSwatch.name : undefined,
      variantId: selectedSwatch?.id || undefined,
      selectedPieces: selectedSetPieceTitles.length > 0 ? selectedSetPieceTitles : undefined,
    };
    addToCart(customizedProduct, quantity);
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 3000);
  };

  const handleBuyNowClick = () => {
    const customizedProduct = {
      ...product,
      selectedColor: selectedSwatch?.name,
      selectedVariant: selectedSwatch ? selectedSwatch.id || selectedSwatch.name : undefined,
      variantId: selectedSwatch?.id || undefined,
      selectedPieces: selectedSetPieceTitles.length > 0 ? selectedSetPieceTitles : undefined,
    };
    addToCart(customizedProduct, quantity);
    router.push('/talep');
  };

  const productCatSlug = typeof product.category === 'object' && product.category !== null 
    ? (product.category as { slug?: string }).slug 
    : String(product.category || '');

  const relatedProducts = storeProducts
    .filter((p) => {
      const cSlug = typeof p.category === 'object' && p.category !== null 
        ? (p.category as { slug?: string }).slug 
        : String(p.category || '');
      return cSlug === productCatSlug && p.id !== product.id;
    })
    .slice(0, 4);

  // Birlikte alınanlar: ürünün kategorisini tamamlayan kategorilerden en çok satanlar
  const complementaryPieces = useMemo(() => {
    if (!product) return [];
    const PAIRS: Record<string, string[]> = {
      'telefon-kiliflari': ['ekran-koruyucular', 'sarj-cihazlari'],
      'ekran-koruyucular': ['telefon-kiliflari', 'kablolar'],
      'sarj-cihazlari': ['kablolar', 'powerbank'],
      kablolar: ['sarj-cihazlari', 'arac-aksesuarlari'],
      powerbank: ['kablolar', 'sarj-cihazlari'],
      kulakliklar: ['sarj-cihazlari', 'kablolar'],
      'arac-aksesuarlari': ['kablolar', 'sarj-cihazlari'],
      'akilli-saat-aksesuarlari': ['sarj-cihazlari', 'kablolar'],
    };
    const wanted = PAIRS[productCatSlug] || [];
    const catOf = (p: Product) => (typeof p.category === 'object' && p.category !== null ? (p.category as { slug?: string }).slug || '' : String(p.category || ''));
    return wanted
      .map((slug) => storeProducts.filter((p) => catOf(p) === slug).sort((x, y) => (y.salesCount || 0) - (x.salesCount || 0))[0])
      .filter((p): p is Product => !!p && p.id !== product.id)
      .slice(0, 2);
  }, [product, storeProducts, productCatSlug]);

  // Tamamlayıcı ürünler önceden işaretli GELMEZ: kullanıcı istemediği ürünleri (ör. B2B teklif paketi) fark etmeden
  // sepete eklemesin. Ürün değişince seçim sıfırlanır.
  const initializedComplementaryProductIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (product?.id && initializedComplementaryProductIdRef.current !== product.id) {
      initializedComplementaryProductIdRef.current = product.id;
      setSelectedComplementaryIds([]);
    }
  }, [product?.id]);

  const toggleComplementaryItem = (pieceId: string) => {
    setSelectedComplementaryIds((prev) =>
      prev.includes(pieceId) ? prev.filter((id) => id !== pieceId) : [...prev, pieceId]
    );
  };

  const bundleItems = useMemo(() => {
    return complementaryPieces.filter((p) => selectedComplementaryIds.includes(p.id));
  }, [complementaryPieces, selectedComplementaryIds]);

  const mainProductPrice = Number(product.price || 0);
  const bundleSubtotal = bundleItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
  const rawTotal = mainProductPrice + bundleSubtotal;
  const bundleDiscount = 0;
  const finalBundleTotal = rawTotal;

  const handleAddBundleToCart = () => {
    if (!product) return;
    const customizedMain = {
      ...product,
      selectedColor: selectedSwatch?.name,
      selectedVariant: selectedSwatch ? selectedSwatch.id || selectedSwatch.name : undefined,
      variantId: selectedSwatch?.id || undefined,
    };
    addToCart(customizedMain, quantity);

    for (const item of bundleItems) {
      addToCart(item, 1);
    }

    toast.success(
      'Sepete eklendi',
      `${product.name} ve ${bundleItems.length} öneri ürünü sepetinize eklendi.`
    );
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 3000);
  };

  const formatPrice = (price: number) => {
    return detailCurrencyFormatter.format(price).replace('TRY', 'TL');
  };

  const cashDiscountPrice = Math.round(product.price * 0.95);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.image, product.image1, product.image2, product.image3].filter(Boolean),
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'UBEI',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: product.price,
      availability: (product.stock && product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="w-full bg-paper min-h-screen py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-line">
          <nav className="text-xs text-neutral-500 flex items-center gap-2">
            <Link href="/" className="hover:text-wood transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/kategori" className="hover:text-wood transition-colors">Ürünler</Link>
            <span>/</span>
            <span className="text-neutral-700 font-medium">
              {typeof product.category === 'object' && product.category !== null
                ? (product.category as { name?: string }).name || (product.category as { slug?: string }).slug || ''
                : String(product.category || '')}
            </span>
            <span>/</span>
            <span className="text-wood-dark font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>

          <Link 
            href={`/kategori/${productCatSlug || 'hepsi'}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-wood transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kategoriye dön</span>
          </Link>
        </div>

        {/* ÜRÜN SAHNESİ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 md:p-10 rounded-xs border border-line mb-12">
          
          {/* Left Column: Interactive Image Gallery with Lens Zoom */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image with Interactive Hover Magnifier */}
            <div 
              ref={imageContainerRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="relative aspect-square bg-neutral-100 rounded-xs overflow-hidden border border-line cursor-crosshair group select-none"
            >
              <img
                ref={zoomImageRef}
                src={currentImage}
                alt={product.name}
                style={{
                  transformOrigin: 'center center',
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                }}
                className="w-full h-full object-cover transition-transform duration-200 ease-out pointer-events-none transform-gpu will-change-transform"
              />

              {/* Zoom Instruction Badge */}
              <div className={`absolute bottom-3 right-3 bg-white text-ink text-xs font-medium px-2 py-1 rounded-xs hidden md:flex items-center gap-1.5 transition-opacity duration-300 pointer-events-none ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                <Eye className="h-3.5 w-3.5" />
                <span>Yakınlaştırmak için üzerine gelin</span>
              </div>

              {/* Kenar okları: görseller arasında geçiş */}
              <EdgeNav
                enabled={imagesList.length > 1}
                onPrev={() => setSelectedImageIndex((i) => (i - 1 + imagesList.length) % imagesList.length)}
                onNext={() => setSelectedImageIndex((i) => (i + 1) % imagesList.length)}
                onEdgeEnter={() => setIsZoomed(false)}
              />

              {/* Tag / Collection Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3 bg-white text-ink font-medium text-xs px-2 py-1 rounded-xs border border-line">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {imagesList.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-xs overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx 
                        ? 'border-ink' 
                        : 'border-line opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ölçü künyesi: yalnız gerçek veri varsa */}
            {(product.dimensions || product.widthCm) && (
              <div className="border border-line rounded-xs p-3.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <Ruler className="h-4 w-4 text-wood" aria-hidden="true" />
                  <span className="text-neutral-600">Özellik</span>
                  <span className="font-mono text-ink tabular-nums-all">
                    {product.dimensions || [product.widthCm && `G ${product.widthCm}`, product.depthCm && `D ${product.depthCm}`, product.heightCm && `Y ${product.heightCm}`].filter(Boolean).join(' × ') + ' cm'}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Title, Swatches, Pricing & Actions */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Header & Title */}
            <div className="space-y-1.5">
              {product.erpItemCode && (
                <span className="font-mono text-xs text-neutral-500 block">Ürün kodu {product.erpItemCode}</span>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="pt-1">
                <LeadTimeBadge product={product} />
              </div>
            </div>

            {/* Editorial Mini Description */}
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Material / Leather Swatch Color Picker */}
            {hasColors && selectedSwatch && (
            <div className="space-y-3 pt-1 border-t border-line">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-wood" />
                  <span>Renk</span>
                </label>
                <span className="text-xs font-bold text-wood">
                  {selectedSwatch.name}
                </span>
              </div>

              {/* Swatches Grid */}
              <div className="flex flex-wrap items-center gap-2">
                {displayedSwatches.map((swatch, idx) => {
                  const isSelected = selectedSwatch.name === swatch.name || selectedSwatch.id === swatch.id;
                  const swatchColor = swatch.hex || swatch.color || '#8A4B20';
                  return (
                    <button
                      key={swatch.id || idx}
                      onClick={() => handleSelectColor(swatch)}
                      className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-wood bg-paper ring-1 ring-wood' 
                          : 'border-line hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <div 
                        style={{ backgroundColor: swatchColor }}
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                      />
                      <span className="text-xs font-semibold text-neutral-800">
                        {swatch.name}
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-wood shrink-0" />}
                    </button>
                  );
                })}
              </div>

            </div>
            )}

            {/* Fiyat */}
            <div className="border-y border-line py-4 space-y-1">
              <span className="text-sm text-neutral-600 block">KDV dahil</span>
              <div className="flex items-baseline gap-3">
                <span className={`font-mono text-3xl font-semibold tracking-tight tabular-nums-all ${product.originalPrice && product.originalPrice > product.price ? 'text-signal' : 'text-ink'}`}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-neutral-500 line-through tabular-nums-all">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">15:00’e kadar verilen siparişler aynı gün kargoda. 1.000 TL üzeri kargo ücretsiz.</p>
              <p className="text-xs text-neutral-600 pt-1">
                10 adet ve üzeri alım için{' '}
                <a
                  hidden={!waNumber} href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Merhaba UBEI, "${product.name}" üründen toplu almak istiyoruz. Adetli fiyat alabilir miyiz?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-wood underline underline-offset-2 hover:text-wood-dark"
                >
                  toplu fiyat isteyin
                </a>
                .
              </p>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div ref={setActionsEl} className="space-y-3 pt-1">
              {/* Action Buttons Row */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2 sm:gap-2.5">
                  <div className="flex items-center justify-between border border-line-strong rounded-xs bg-white shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Adedi azalt"
                      className="h-11 w-11 text-base text-neutral-700 hover:text-ink cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-sm text-ink tabular-nums-all" aria-live="polite">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Adedi artır"
                      className="h-11 w-11 text-base text-neutral-700 hover:text-ink cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCartClick}
                    className="flex-1 min-w-[130px] h-11 flex items-center justify-center gap-1.5 px-3 sm:px-4 rounded-xs text-sm font-semibold bg-ink hover:bg-neutral-800 text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                    <span>Sepete Ekle</span>
                  </button>

                  {/* Buy Now Button (UNTOUCHABLE: Hemen Al) */}
                  <button
                    onClick={handleBuyNowClick}
                    className="flex-1 min-w-[120px] h-11 flex items-center justify-center gap-1.5 px-3 sm:px-4 rounded-xs text-sm font-semibold bg-brand hover:bg-brand-dark text-ink transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Hemen Al</span>
                  </button>

                  {/* Toggle Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product)}
                    className={`h-11 w-11 flex items-center justify-center rounded-xs border transition-colors cursor-pointer shrink-0 ${
                      isFavorite 
                        ? 'bg-white border-signal text-signal' 
                        : 'bg-white border-line text-neutral-600 hover:text-wood'
                    }`}
                    aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    aria-pressed={isFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* PROMINENT WHATSAPP ORDER LINE - ESNAF DÖNÜŞÜM BUTONU */}
                {(() => {
                  const setPiecesSummaryText = product.setPieces && product.setPieces.length > 0 && selectedSetPieceTitles.length > 0
                    ? `\n• Seçili Takım Parçaları: ${selectedSetPieceTitles.join(', ')} (${selectedSetPieceTitles.length}/${product.setPieces.length} Parça)`
                    : '';
                  // Ölçü/malzeme yalnız ürün kaydında varsa mesaja eklenir (uydurma varsayılan yok)
                  const waDimensions = product.dimensions || (product.widthCm ? `${product.widthCm}x${product.depthCm}x${product.heightCm} cm` : '');
                  const waSpecText = `${waDimensions ? `\n• Ölçüler: ${waDimensions}` : ''}${product.material ? `\n• Malzeme: ${product.material}` : ''}`;
                  return (
                    <a
                      hidden={!waNumber} href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `Merhaba UBEI, web sitenizden "${product.name}" hakkında bilgi almak istiyorum.${selectedSwatch ? `\n• Seçili Renk: ${selectedSwatch.name}` : ''}${setPiecesSummaryText}${waSpecText}\n• Fiyat: ${formatPrice(product.price)}\n• Ürün Linki: https://ubei.com.tr/urun/${product.id}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-11 border border-whatsapp text-whatsapp hover:bg-whatsapp hover:text-white font-semibold text-sm px-4 rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp’tan sorun</span>
                    </a>
                  );
                })()}
              </div>

              {addedToCartSuccess && (
                <div role="status" className="bg-ok-soft border border-ok/25 text-ok p-3 rounded-xs text-sm flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{selectedSwatch ? <><strong>{selectedSwatch.name}</strong> seçeneğiyle sepete eklendi.</> : 'Sepete eklendi.'}</span>
                </div>
              )}

              {/* Teknik bilgi */}
              <dl className="bg-white border border-line rounded-xs p-3.5 space-y-2 text-sm">
                {product.material && (
                  <div className="flex justify-between gap-4"><dt className="text-neutral-600">Malzeme</dt><dd className="text-ink text-right">{product.material}</dd></div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between gap-4"><dt className="text-neutral-600">Özellik</dt><dd className="text-ink text-right">{product.dimensions}</dd></div>
                )}
                <div className="flex justify-between gap-4"><dt className="text-neutral-600">Stok</dt><dd className="text-ink text-right">{product.stock && product.stock > 0 ? `${product.stock} adet` : 'Tedarikte'}</dd></div>
              </dl>
            </div>

            {/* Interactive Modular Set Pieces Breakdown */}
            {product.setPieces && product.setPieces.length > 0 && (
              <div className="bg-paper border border-line rounded-xs p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <Box className="h-4 w-4 text-wood" />
                    <span>Takım parçaları</span>
                  </span>
                  <span className="font-mono text-xs text-neutral-600 tabular-nums-all">
                    {selectedSetPieceTitles.length} / {product.setPieces.length} parça seçili
                  </span>
                </div>

                <div className="space-y-1.5">
                  {product.setPieces.map((piece, pIdx) => {
                    const isSelected = selectedSetPieceTitles.includes(piece.title);
                    return (
                      <div 
                        key={pIdx} 
                        onClick={() => toggleSetPiece(piece.title)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleSetPiece(piece.title);
                          }
                        }}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`flex items-center justify-between text-xs p-2.5 rounded-xs border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-white border-wood/70' 
                            : 'bg-neutral-50/80 border-dashed border-line-strong opacity-60 hover:opacity-85'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-ink border-ink text-white' : 'border-neutral-400 bg-white'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className={`font-semibold ${isSelected ? 'text-neutral-900' : 'text-neutral-500 line-through'}`}>
                              {piece.title}
                            </span>
                            {piece.dimensions && (
                              <span className="text-neutral-500 text-xs ml-1.5">({piece.dimensions})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isSelected && (
                            <span className="text-xs font-medium text-wood-dark">
                              + Dahil Et
                            </span>
                          )}
                          {piece.pieceProductId && (
                            <Link
                              href={`/urun/${piece.pieceProductId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-bold text-wood hover:text-wood-dark hover:underline"
                            >
                              <span>Ayrı İncele</span>
                              <CornerDownRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed pt-1 border-t border-line/60">
                  * Takımdan çıkarmak veya geri eklemek istediğiniz parçaların üzerine tıklayabilirsiniz. Tercihiniz sepete ve WhatsApp sipariş temsilcisine otomatik aktarılır.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* AYRINTI SEKMELERİ */}
        <div className="bg-white rounded-xs border border-line overflow-hidden mb-16">
          
          {/* Tab Headers Bar */}
          <div className="flex border-b border-line bg-paper overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('desc')}
              className={`py-4 px-6 text-sm md:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-wood text-neutral-900 bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Ürün Açıklaması
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-6 text-sm md:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-wood text-neutral-900 bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Özellikler
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-4 px-6 text-sm md:text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'delivery'
                  ? 'border-wood text-neutral-900 bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Kargo ve iade
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="p-6 md:p-10">
            
            {/* TAB 1: ÜRÜN AÇIKLAMASI */}
            {activeTab === 'desc' && (
              <div className="space-y-8 animate-fade-in">
                <div className="prose max-w-none text-neutral-700 text-sm leading-relaxed space-y-4">
                  <h3 className="text-lg font-display font-bold text-ink tracking-tight">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p>
                      {product.description}
                    </p>
                  )}
                  {product.material && (
                    <p>
                      Malzeme: {product.material}.
                    </p>
                  )}
                </div>

                {/* Özellikler: yalnız ürün kaydında varsa */}
                {product.features && product.features.length > 0 && (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pt-4 border-t border-line">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 py-2 border-b border-line">
                        <CheckCircle className="h-4 w-4 text-wood flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-800">{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* TAB 2: ÖZELLİKLER */}
            {activeTab === 'specs' && (
              <div className="space-y-6 animate-fade-in">
                <dl className="border border-line rounded-xs divide-y divide-line text-sm">
                  {[
                    ['Kategori', typeof product.category === 'object' && product.category !== null ? (product.category as { name?: string }).name || '' : String(product.category || '')],
                    ['Malzeme', product.material],
                    ['Özellik', product.dimensions],
                    ['Renk seçenekleri', productColors.map((c) => c.name).join(', ')],
                    ['Garanti', '2 yıl'],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 px-4 py-3">
                      <dt className="text-neutral-600">{k}</dt>
                      <dd className="text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* TAB 3: TESLİMAT VE İADE KOŞULLARI */}
            {activeTab === 'delivery' && (
              <div className="space-y-6 animate-fade-in text-neutral-700 text-xs md:text-sm leading-relaxed">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Delivery Info */}
                  <div className="p-6 bg-paper rounded-xs border border-line space-y-3">
                    <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                      <Truck className="h-5 w-5 text-wood" />
                      <h4>Kargo</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-600 list-disc list-inside">
                      <li><strong>Aynı gün kargo:</strong> Hafta içi 15:00’e kadar verilen siparişler aynı gün kargoya verilir.</li>
                      <li><strong>Teslim süresi:</strong> Çoğu ilde 1-2 iş günü, doğu ve güneydoğu illerinde 2-3 iş günü.</li>
                      <li><strong>Kargo ücreti:</strong> 1.000 TL ve üzeri siparişlerde ücretsiz, altında 79 TL.</li>
                    </ul>
                  </div>

                  {/* Return & Warranty Info */}
                  <div className="p-6 bg-paper rounded-xs border border-line space-y-3">
                    <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                      <ShieldCheck className="h-5 w-5 text-wood" />
                      <h4>İade ve garanti</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-600 list-disc list-inside">
                      <li><strong>14 gün iade:</strong> Teslimattan itibaren 14 gün içinde, kutusu açılmış olsa bile iade edebilirsiniz.</li>
                      <li><strong>Telefonunuza uymadıysa:</strong> Yanlış model gönderimlerinde değişim kargosu bizden.</li>
                      <li><strong>2 yıl garanti:</strong> Şarj cihazı, powerbank ve kulaklıklarda arızalı ürünü yenisiyle değiştiririz.</li>
                    </ul>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* BİRLİKTE ALINANLAR */}
        {complementaryPieces.length > 0 && (
          <div className="bg-paper border border-line rounded-xs p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-line pb-5">
              <div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                  Birlikte alınanlar
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Bu ürünle sık alınan aksesuarları tek tıkla sepete ekleyebilirsiniz.
                </p>
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Product Cards Row */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Main Product Card */}
                <div className="relative bg-white border-2 border-wood rounded-xs p-3 flex flex-col justify-between">
                  <div className="absolute -top-2.5 left-3 bg-brand text-ink text-sm font-semibold px-2 py-0.5 rounded-xs">
                    Bu ürün
                  </div>
                  <div>
                    <div className="aspect-square w-full bg-paper rounded-xs overflow-hidden relative mb-2.5 mt-1">
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                      {product.name}
                    </h4>
                    {selectedSwatch && (
                      <p className="text-xs text-wood font-medium mt-0.5">
                        Renk: {selectedSwatch.name}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-xs font-extrabold text-neutral-900">
                      ₺{mainProductPrice.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-xs font-medium text-ok">
                      Dahil
                    </span>
                  </div>
                </div>

                {/* Complementary Pieces Cards */}
                {complementaryPieces.map((piece) => {
                  const isSelected = selectedComplementaryIds.includes(piece.id);
                  const pieceImages = getProductImages(piece);
                  const pieceThumb = pieceImages[0] || '/images/placeholder.webp';
                  const pPrice = Number(piece.price || 0);

                  return (
                    <div
                      key={piece.id}
                      onClick={() => toggleComplementaryItem(piece.id)}
                      className={`relative bg-white border rounded-xs p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none ${
                        isSelected
                          ? 'border-neutral-900 ring-1 ring-neutral-900'
                          : 'border-line opacity-60 hover:opacity-100 hover:border-line-strong'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Öneri
                          </span>
                          <button
                            type="button"
                            aria-label={isSelected ? 'Çıkar' : 'Ekle'}
                            className="text-neutral-900"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-wood" />
                            ) : (
                              <Square className="h-4 w-4 text-neutral-500" />
                            )}
                          </button>
                        </div>

                        <div className="aspect-square w-full bg-paper rounded-xs overflow-hidden relative mb-2.5">
                          <img
                            src={pieceThumb}
                            alt={piece.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                          {piece.name}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {typeof piece.category === 'object' && piece.category !== null
                            ? (piece.category as { name?: string }).name || ''
                            : String(piece.category || '')}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-line flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          ₺{pPrice.toLocaleString('tr-TR')}
                        </span>
                        <span
                          className={`text-sm font-semibold px-1.5 py-0.5 rounded-xs ${
                            isSelected
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {isSelected ? 'Eklendi' : 'Ekle'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bundle Checkout Summary Box */}
              <div className="lg:col-span-4 bg-white border border-line rounded-xs p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-wood">
                    Özet
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900">
                    1 ürün + {bundleItems.length} öneri
                  </h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-line text-xs">
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Toplam:
                    </span>
                    <span className="text-lg font-extrabold text-neutral-900 font-display">
                      ₺{finalBundleTotal.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>


                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className="w-full bg-ink hover:bg-neutral-800 text-white py-3 px-4 rounded-xs text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {bundleItems.length > 0 ? 'Hepsini sepete ekle' : 'Yalnız bu ürünü ekle'}
                  </span>
                </button>

                <div className="space-y-1 text-xs text-neutral-500 border-t border-line pt-3">
                  <p className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-wood" />
                    Hepsi tek pakette kargolanır
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-wood" />
                    1.000 TL üzeri kargo ücretsiz
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-display text-xl md:text-2xl font-bold text-neutral-900 tracking-tight border-l-4 border-wood pl-4">
              Benzer ürünler
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      
      </div>

      {/* Mobil sabit satın alma çubuğu: yukarıdaki butonlarla aynı işlevler */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-line px-4 py-3 flex items-center gap-3 transition-transform duration-300 print:hidden ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!showStickyBar}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs text-neutral-600 truncate">{product.name}</p>
          <p className="font-mono text-base font-semibold text-ink tabular-nums-all">{formatPrice(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCartClick}
          tabIndex={showStickyBar ? 0 : -1}
          className="h-11 px-3 bg-ink hover:bg-neutral-800 text-white text-sm font-semibold rounded-xs cursor-pointer"
        >
          Sepete ekle
        </button>
        <button
          type="button"
          onClick={handleBuyNowClick}
          tabIndex={showStickyBar ? 0 : -1}
          className="h-11 px-3 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold rounded-xs cursor-pointer"
        >
          Hemen Al
        </button>
      </div>
    </div>
  );
}
