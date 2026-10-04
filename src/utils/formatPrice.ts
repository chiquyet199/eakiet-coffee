/**
 * Format price with currency (default VND). A missing price means "quoted on request".
 */
export function formatPrice(
  price: number | undefined,
  currency: string = 'VND'
): string {
  if (price === undefined) return 'Liên hệ báo giá';
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
