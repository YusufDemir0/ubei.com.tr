import React from 'react';
import type { Product } from '../types';

interface LeadTimeBadgeProps {
  product: Pick<Product, 'stock' | 'leadTimeDays'>;
  className?: string;
}

/** Stok / üretim süresi metninin tek kaynağı (ürün sayfası, sepet çekmecesi ve sepet sayfası aynı metni gösterir). */
export function getLeadTimeLabel(product: Pick<Product, 'stock' | 'leadTimeDays'>): { inStock: boolean; label: string } {
  if (product.stock && product.stock > 0) {
    return { inStock: true, label: 'Stokta · 1–2 iş günü sevkiyat' };
  }
  const days = product.leadTimeDays && product.leadTimeDays > 0 ? `${product.leadTimeDays}` : '3–5';
  return { inStock: false, label: `Tedarikte · ${days} iş günü` };
}

export const LeadTimeBadge: React.FC<LeadTimeBadgeProps> = ({ product, className = '' }) => {
  const { inStock, label } = getLeadTimeLabel(product);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-xs border ${
        inStock ? 'text-ok bg-ok-soft border-ok/25' : 'text-wood-dark bg-paper border-line'
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-ok' : 'bg-wood'}`} aria-hidden="true" />
      {label}
    </span>
  );
};

export default LeadTimeBadge;
