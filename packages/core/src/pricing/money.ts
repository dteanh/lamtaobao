import type { MoneyValue } from '@culi/theme-sdk/contracts';

export function formatMoney(amount: number, currency: string): MoneyValue {
  return {
    amount,
    currency,
    formatted: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount),
  };
}

export function resolveActivePrice(price: number, salePrice?: number | null) {
  return salePrice && salePrice < price ? salePrice : price;
}
