'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, Heart, ShoppingBag, Phone, Mail,
  MessageSquare, Menu, X, ChevronRight 
} from 'lucide-react';
import UpperNavbar from './UpperNavbar';
import BrandLogo from './BrandLogo';
import CategoryBar from './CategoryBar';
import { useUIStore } from '../stores/useUIStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useCMSStore } from '../stores/useCMSStore';
import { useWhatsappNumber } from '../lib/whatsapp';

export const Navbar: React.FC = () => {
  const waNumber = useWhatsappNumber(); // Tüm WhatsApp butonları tek kaynaktan (Admin > İletişim Bilgileri)
  const pathname = usePathname();
  const router = useRouter();

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Zustand Store Selectors
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const openCart = useUIStore((state) => state.openCart);
  const openFavorites = useUIStore((state) => state.openFavorites);

  const contactInfo = useCMSStore((state) => state.contactInfo);
  const socialLinks = useCMSStore((state) => state.socialLinks);
  const categories = useCMSStore((state) => state.categories);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  // Sıralama: Alfabetik DEĞİL, sortOrder bazlı
  const sortedCategories = React.useMemo(() => {
    return [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories]);

  // Ana Kategoriler (Kök Seviye)
  const rootCategories = React.useMemo(() => {
    return sortedCategories.filter((c) => !c.parentId);
  }, [sortedCategories]);

  // Mount & Scroll Listener with Hysteresis for Smooth Sticky Header (60-120 FPS RAF throttled)
  useEffect(() => {
    setMounted(true);

    let isScrolledLocal = window.scrollY > 70;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > 70 && !isScrolledLocal) {
            isScrolledLocal = true;
            setIsScrolled(true);
          } else if (currentScrollY < 20 && isScrolledLocal) {
            isScrolledLocal = false;
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Mobil menü açıkken Esc kapatır ve arka plan kaydırılmaz
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMobileMenuOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobileMenuOpen]);

  // Arama kutusu dışarı tıklanınca ya da Esc ile kapanır; açık kalıp menünün üstünü örtmesin
  const searchWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showSearchInput) return;
    const onDown = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setShowSearchInput(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowSearchInput(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [showSearchInput]);
  useEffect(() => setShowSearchInput(false), [pathname]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/kategori/hepsi?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchInput(false);
    }
  };

  const landingPageConfig = useCMSStore((state) => state.landingPageConfig);
  // Açılış tercihi "home" değilse kök URL ürün listesini gösterir; vitrin /anasayfa'dadır (FAZ 15)
  const isCustomLanding = landingPageConfig?.type === 'category' || landingPageConfig?.type === 'catalog';
  const homeHref = isCustomLanding ? '/anasayfa' : '/';
  const showCategoryBar =
    pathname.startsWith('/kategori') ||
    pathname.startsWith('/urun/') ||
    (pathname === '/' && landingPageConfig?.type === 'category');

  const navLinks = [
    { name: 'ANASAYFA', href: homeHref },
    { name: 'ÜRÜNLER', href: '/kategori' },
    { name: 'İNDİRİMLER', href: '/indirimler' },
    { name: 'HAKKIMIZDA', href: '/kurumsal' },
    { name: 'İLETİŞİM', href: '/iletisim' },
  ];

  // Yönetim paneli kendi tam ekran düzenini kullanır
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <header className="w-full z-40 bg-white sticky top-0 border-b border-line transition-all duration-300">
        {/* 1. DUYURU BANDI: başlıkla birlikte yapışkan, sonsuz kayar */}
        <UpperNavbar />

        {/* 2. MAIN HEADER ROW (Compact on Scroll) */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? 'py-2.5' : 'py-3.5'}`}>
          
          {/* Left: Mobile Hamburger Trigger & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-neutral-800 hover:text-wood rounded-xs transition-colors cursor-pointer"
              aria-label="Menüyü Aç"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo, "Anasayfa" bağlantısıyla aynı yere gider (açılış tercihi kategori ise kök URL ürün listesidir) */}
            <Link href={homeHref} className="flex items-center shrink-0" title="UBEI - Ana sayfa">
              <BrandLogo variant="onLight" priority className="h-9 md:h-11 w-auto" />
            </Link>
          </div>

          {/* Center Main Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' || link.href === '/anasayfa'
                  ? pathname === link.href
                  : link.href === '/kategori'
                  ? pathname.startsWith('/kategori') || pathname.startsWith('/urun/') || (isCustomLanding && pathname === '/')
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold tracking-wider transition-colors duration-200 py-1 border-b-2 uppercase ${
                    isActive
                      ? 'text-wood border-wood'
                      : 'text-neutral-700 hover:text-wood border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Actions & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Expandable Search Trigger */}
            <div className="relative" ref={searchWrapRef}>
              <button
                onClick={() => setShowSearchInput(!showSearchInput)}
                aria-expanded={showSearchInput}
                className="p-2 text-neutral-700 hover:text-wood hover:bg-neutral-100/80 rounded-full transition-colors cursor-pointer"
                aria-label="Arama Yap"
              >
                <Search className="h-4 w-4" />
              </button>

              {showSearchInput && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 top-12 z-50 w-72 bg-white text-neutral-900 p-2 rounded-xs shadow-xl border border-line flex items-center gap-2 animate-fade-in"
                >
                  <input
                    type="text"
                    placeholder="Koleksiyon veya model ara..."
                    value={searchQuery} maxLength={100}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-xs p-2 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-neutral-900 text-white px-3 py-1.5 text-xs font-semibold rounded-xs hover:bg-neutral-800 transition-colors"
                  >
                    Ara
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact Form Icon Link */}
            <Link
              href="/iletisim"
              className="p-2 text-neutral-700 hover:text-wood hover:bg-neutral-100/80 rounded-full transition-colors hidden sm:flex cursor-pointer"
              title="İletişim"
            >
              <Mail className="h-4 w-4" />
            </Link>




            {/* Favorites Trigger */}
            <button
              onClick={openFavorites}
              className="p-2 text-neutral-700 hover:text-wood hover:bg-neutral-100/80 rounded-full transition-colors relative cursor-pointer"
              aria-label="Favoriler"
            >
              <Heart className="h-4 w-4" />
              {mounted && favoritesCount > 0 && (
                <span className="absolute top-0 right-0 bg-neutral-900 text-white text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="p-2 text-neutral-700 hover:text-wood hover:bg-neutral-100/80 rounded-full transition-colors relative cursor-pointer"
              aria-label="Sepet"
            >
              <ShoppingBag className="h-4 w-4" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand text-ink text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

      </header>

        {/* 3. KATEGORİ ÇUBUĞU: yalnız ürün listesi ve ürün detay sayfalarında (kök URL kategori açılışıysa orada da) */}
        {showCategoryBar && (
          <CategoryBar rootCategories={rootCategories} sortedCategories={sortedCategories} pathname={pathname} />
        )}

      {/* ============================================================ */}
      {/* 5. MOBILE HAMBURGER MENU DRAWER (Full Slide-In Sheet)         */}
      {/* ============================================================ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menü">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-950/60 animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-slide-in">
            {/* Header */}
            <div>
              <div className="p-5 border-b border-line flex items-center justify-between bg-paper">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} aria-label="Ana sayfa">
                  <BrandLogo variant="onLight" className="h-10 w-auto" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Menüyü kapat"
                  className="p-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Nav Links */}
              <div className="p-4 space-y-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-3 block mb-2">
                  Menü
                </span>
                {navLinks.map((link) => {
                  const isActive =
                    link.href === '/' || link.href === '/anasayfa'
                      ? pathname === link.href
                      : link.href === '/kategori'
                      ? pathname.startsWith('/kategori') || pathname.startsWith('/urun/') || (isCustomLanding && pathname === '/')
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xs text-sm font-semibold transition-colors ${
                        isActive ? 'bg-paper text-wood' : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                    </Link>
                  );
                })}
              </div>

              {/* Categories Section */}
              <div className="p-4 border-t border-line space-y-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-3 block mb-2">
                  Kategoriler
                </span>
                {rootCategories.map((cat) => {
                  const children = sortedCategories.filter((c) => c.parentId === cat.id);
                  const isCatActive = pathname === `/kategori/${cat.slug}`;

                  return (
                    <div key={cat.id} className="space-y-0.5">
                      <Link
                        href={`/kategori/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 text-xs transition-colors rounded-xs ${
                          isCatActive
                            ? 'bg-paper text-wood font-bold'
                            : 'text-neutral-800 hover:text-wood hover:bg-neutral-50'
                        }`}
                      >
                        <span className="font-semibold">{cat.name}</span>
                        <ChevronRight className="h-3 w-3 text-neutral-300" />
                      </Link>

                      {children.length > 0 && (
                        <div className="pl-5 space-y-0.5 border-l-2 border-line ml-3 py-1">
                          {children.map((subCat) => {
                            const isSubActive = pathname === `/kategori/${subCat.slug}`;
                            return (
                              <Link
                                key={subCat.id}
                                href={`/kategori/${subCat.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-xs transition-colors ${
                                  isSubActive
                                    ? 'text-wood font-bold bg-paper'
                                    : 'text-neutral-600 hover:text-wood'
                                }`}
                              >
                                <span>↳ {subCat.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Contact & Account */}
            <div className="p-5 border-t border-line bg-paper space-y-3">
              <a
                hidden={!waNumber} href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Merhaba UBEI, mobil sitenizden ulaşıyorum. Bilgi almak istiyorum.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-whatsapp hover:bg-whatsapp-dark text-white text-xs font-semibold py-3 px-4 rounded-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp ile yazın</span>
              </a>

              {/* Social Channels Mini Bar */}
              <div className="flex items-center justify-center gap-4 pt-1">
                {socialLinks?.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-wood text-xs font-semibold">
                    Instagram
                  </a>
                )}
                {socialLinks?.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-wood text-xs font-semibold">
                    YouTube
                  </a>
                )}
                {socialLinks?.telegram && (
                  <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-wood text-xs font-semibold">
                    Telegram
                  </a>
                )}
              </div>

              <div className="text-xs text-neutral-600 space-y-1 pt-1 text-center">
                {contactInfo.phone && (
                  <p className="flex items-center justify-center gap-1.5 font-medium">
                    <Phone className="h-3.5 w-3.5 text-wood" />
                    <span>{contactInfo.phone}</span>
                  </p>
                )}
                {contactInfo.workingHours && <p className="text-neutral-500 text-xs">{contactInfo.workingHours}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
