/**
 * Standard Price Formatter for Turkish Lira (TL)
 */
export function formatPrice(amount: number | string | undefined | null): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  if (isNaN(num)) return '0 TL';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(num).replace('TRY', 'TL');
}

export default formatPrice;
