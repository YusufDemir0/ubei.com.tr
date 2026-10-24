'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCMSStore, type HeroSlide } from '../stores/useCMSStore';
import OptimizedImage from './OptimizedImage';
import EdgeNav from './EdgeNav';
import { Skeleton, TextSkeleton } from './Skeleton';

interface HeroProps {
  /** Sayfa düzeninden gelen slaytlar; verilirse CMS deposu beklenmez */
  slides?: HeroSlide[];
}

export const Hero: React.FC<HeroProps> = ({ slides: propSlides }) => {
  const homeConfig = useCMSStore((state) => state.homeConfig);
  const slides = propSlides ?? (homeConfig?.heroSlides || []);
  const categories = useCMSStore((state) => state.categories);
  const storeLoaded = useCMSStore((state) => state.cmsLoaded);
  const cmsLoaded = propSlides !== undefined || storeLoaded;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Önizlemede slayt silinirse sayaç geçerli aralıkta kalsın
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) setCurrentSlide(0);
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // CMS gelene kadar varsayılan slayt gösterilmez (önce eski metin görünüp sonra değişmesin); aynı ölçüde iskelet
  if (!cmsLoaded) {
    return (
      <section className="relative w-full h-[65vh] md:h-[82vh] bg-paper-deep/60 overflow-hidden" aria-busy="true" aria-label="Yükleniyor">
        <div className="absolute inset-0 animate-pulse bg-paper-deep/50" />
        <div className="absolute inset-0 flex items-end md:items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-0">
          <div className="w-full max-w-xl bg-white p-6 md:p-10 border-l-4 border-brand space-y-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-9 w-3/5" />
            <TextSkeleton lines={2} />
            <Skeleton className="h-12 w-44" />
          </div>
        </div>
      </section>
    );
  }

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentSlide] || slides[0];

  // CMS'te silinmiş bir kategoriye işaret eden buton 404'e düşmesin: tüm ürünler sayfasına yönlendir.
  const resolveButtonLink = (link?: string): string => {
    if (!link) return '/kategori';
    const match = link.match(/^\/kategori\/([^/?#]+)/);
    if (match && categories.length > 0 && !categories.some((c) => c.slug === match[1])) {
      return '/kategori';
    }
    return link;
  };

  return (
    <section 
      id="hero-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[65vh] md:h-[82vh] bg-ink overflow-hidden select-none"
    >
      {/* Background Slides */}
      {slides.map((slide, index) => {
        const isCurrent = (currentSlide % slides.length) === index;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.image ? (
              <OptimizedImage
                src={slide.image}
                alt={slide.title || 'UBEI'}
                fill
                priority={index === 0}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-ink" />
            )}
            <div className="absolute inset-0 bg-ink/25" />
          </div>
        );
      })}

      {/* Content Overlay: düz, opak panel (cam efekti yok) */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-end md:items-center justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-0">
        <div key={currentSlide} className="pointer-events-auto max-w-xl bg-white p-6 md:p-10 border-l-4 border-brand animate-fade-in">
          {activeSlide.badge && (
            <span className="text-xs font-semibold text-wood uppercase tracking-wider block mb-3">
              {activeSlide.badge}
            </span>
          )}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.08] tracking-tight mb-4">
            {activeSlide.title}
          </h2>
          {activeSlide.subtitle && (
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-6 md:mb-8">
              {activeSlide.subtitle}
            </p>
          )}
          <Link
            href={resolveButtonLink(activeSlide.buttonLink)}
            className="group inline-flex items-center gap-2.5 bg-brand hover:bg-brand-dark text-ink text-sm font-semibold py-3.5 px-6 transition-colors duration-200 rounded-xs"
          >
            <span>{activeSlide.buttonText || 'Ürünleri incele'}</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Kenar okları: slaytlar arasında geçiş (fare kenara yaklaşınca belirginleşir) */}
      <EdgeNav enabled={slides.length > 1} onPrev={handlePrev} onNext={handleNext} label="slayt" tone="dark" zoneClassName="w-16 md:w-24" />

      {/* Slayt sayacı */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-30 bg-white px-2.5 py-1 font-mono text-xs text-neutral-700 tabular-nums-all" aria-live="polite">
          {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      )}
    </section>
  );
};

export default Hero;
