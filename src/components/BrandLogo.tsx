import React from 'react';

interface BrandLogoProps {
  /** 'onLight': koyu yazılı logo (açık zemin), 'onDark': beyaz yazılı logo (koyu zemin) */
  variant?: 'onLight' | 'onDark';
  className?: string;
  priority?: boolean;
}

// Logo 330×110 (3:1) SVG; width/height verilerek yerleşim kayması önlenir.
export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'onLight', className = 'h-10 w-auto', priority = false }) => (
  <img
    src={variant === 'onLight' ? '/marka/logo-koyu.svg' : '/marka/logo-acik.svg'}
    width={330}
    height={110}
    alt="UBEI"
    className={className}
    loading={priority ? 'eager' : 'lazy'}
    decoding="async"
  />
);

export default BrandLogo;
