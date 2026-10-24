'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EdgeNavProps {
  onPrev: () => void;
  onNext: () => void;
  /** Ok ve kaydırma yalnız birden fazla görsel/slayt varsa gösterilir */
  enabled: boolean;
  /** Kenar alanına girildiğinde (ör. görsel büyütecini kapatmak için) */
  onEdgeEnter?: () => void;
  label?: string;
  tone?: 'light' | 'dark';
  /** Kenar alanının genişliği (varsayılan: görselin %18'i) */
  zoneClassName?: string;
}

/**
 * Görselin iki kenarında görünmez geçiş alanları: ok silik durur, fare o kenara yaklaşınca belirginleşir,
 * tıklayınca o yöne geçer. Dokunmatik ekranda yatay kaydırma (swipe) da desteklenir.
 * Üst öğe `relative` olmalıdır; alanlar görselin üstüne mutlak konumlanır.
 */
export const EdgeNav: React.FC<EdgeNavProps> = ({
  onPrev,
  onNext,
  enabled,
  onEdgeEnter,
  label = 'görsel',
  tone = 'light',
  zoneClassName = 'w-[18%] min-w-14',
}) => {
  const touchStartX = useRef<number | null>(null);
  if (!enabled) return null;

  const arrow =
    tone === 'light'
      ? 'bg-white/80 text-ink group-hover/edge:bg-white'
      : 'bg-ink/50 text-white group-hover/edge:bg-ink/80';

  const zone = (dir: 'prev' | 'next') => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (dir === 'prev') onPrev();
        else onNext();
      }}
      onMouseEnter={onEdgeEnter}
      data-edge-nav="true"
      aria-label={dir === 'prev' ? `Önceki ${label}` : `Sonraki ${label}`}
      className={`group/edge absolute inset-y-0 ${dir === 'prev' ? 'left-0 justify-start pl-3' : 'right-0 justify-end pr-3'} z-20 ${zoneClassName} flex items-center cursor-pointer focus-visible:outline-none`}
    >
      <span
        className={`h-11 w-11 rounded-full flex items-center justify-center opacity-40 group-hover/edge:opacity-100 group-focus-visible/edge:opacity-100 group-hover/edge:scale-105 transition duration-200 ${arrow}`}
        aria-hidden="true"
      >
        {dir === 'prev' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </span>
    </button>
  );

  return (
    <>
      {/* Dokunmatik kaydırma: tüm görsel alanı (okların altında) */}
      <div
        className="absolute inset-0 z-10 md:hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) < 40) return;
          if (dx > 0) onPrev();
          else onNext();
        }}
        aria-hidden="true"
      />
      {zone('prev')}
      {zone('next')}
    </>
  );
};

export default EdgeNav;
