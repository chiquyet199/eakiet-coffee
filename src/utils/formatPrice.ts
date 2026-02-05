/**
 * Format price with currency (default VND).
 */
export function formatPrice(
  price: number,
  currency: string = 'VND'
): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + ' ₫';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}
