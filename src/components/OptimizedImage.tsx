'use client';

import React, { useState, useCallback, memo } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  aspectRatio?: string;
  fallbackSrc?: string;
  sizes?: string;
}

const cleanImageSrc = (src: string): string => {
  if (!src) return '';
  // Eski kayıtlarda backend'in mutlak adresi (http://localhost:5000/uploads/...) saklanmış olabilir;
  // /uploads/* Next.js rewrite ile backend'e proxylendiği için göreli yola çevir.
  const relative = src.replace(/^https?:\/\/(localhost|127\.0\.0\.1|api_backend)(:\d+)?(?=\/uploads\/)/i, '');
  if (relative.includes('%252F')) {
    return relative.replace(/%252F/g, '%2F');
  }
  return relative;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src: initialSrc,
  alt,
  className = '',
  width,
  height,
  fill = false,
  priority = false,
  aspectRatio,
  fallbackSrc,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}) => {
  const [hasError, setHasError] = useState(false);
  // Görsel optimizasyonu (/_next/image) zaman aşımına uğrar ya da hata verirse önce özgün dosya denenir;
  // eskiden tek hatada kart kalıcı olarak "Görsel Eklenmedi" gösteriyordu
  const [retryUnoptimized, setRetryUnoptimized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const cleanedSrc = cleanImageSrc(initialSrc);
  const activeSrc = hasError && fallbackSrc ? fallbackSrc : cleanedSrc;

  const handleError = () => {
    if (!retryUnoptimized && !hasError && cleanedSrc.startsWith('/')) {
      setRetryUnoptimized(true);
      return;
    }
    if (!hasError) {
      setHasError(true);
    }
  };

  // Görsel React devreye girmeden (hydration) önce yüklendiyse onLoad hiç tetiklenmez ve görsel opacity-0'da kalır
  const markIfComplete = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setIsLoaded(true);
  }, []);

  // If no source is provided or image failed to load with no valid fallback
  if (!activeSrc || (hasError && !fallbackSrc)) {
    return (
      <div
        className={`bg-neutral-100 text-neutral-500 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <svg
          className="h-8 w-8 text-neutral-300 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs uppercase font-bold tracking-wider text-neutral-500">
          Görsel Eklenmedi
        </span>
      </div>
    );
  }

  const isDataUri = activeSrc.startsWith('data:');
  const isSvg = activeSrc.endsWith('.svg') || activeSrc.includes('image/svg+xml');

  // Handle data URIs and inline SVGs directly
  if (isDataUri || isSvg) {
    return (
      <img
        ref={markIfComplete}
        src={activeSrc}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 transform-gpu`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse z-10" />
      )}
      <Image
        src={activeSrc}
        alt={alt}
        width={!fill ? width || 800 : undefined}
        height={!fill ? height || 600 : undefined}
        fill={fill}
        priority={priority}
        unoptimized={retryUnoptimized}
        loading={priority ? undefined : 'lazy'}
        decoding="async"
        quality={75}
        className={`${className} transition-opacity duration-300 transform-gpu ${
          !isLoaded && !priority ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        sizes={sizes}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
