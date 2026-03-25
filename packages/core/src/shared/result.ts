export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_QUANTITY'
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'COUPON_NOT_FOUND'
  | 'COUPON_NOT_STARTED'
  | 'COUPON_EXPIRED'
  | 'COUPON_USAGE_LIMIT'
  | 'COUPON_MINIMUM_NOT_MET'
  | 'EMPTY_CART'
  | 'CART_NOT_ACTIVE'
  | 'CUSTOMER_NAME_REQUIRED'
  | 'CUSTOMER_EMAIL_INVALID'
  | 'ADDRESS_REQUIRED'
  | 'CITY_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'CHECKOUT_ALREADY_PROCESSED'
  | 'INVALID_INPUT'
  | 'UNKNOWN_ERROR';

export type AppResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: AppErrorCode; message: string } };

export function ok<T>(data: T): AppResult<T> {
  return { ok: true, data };
}

export function err(code: AppErrorCode, message?: string): AppResult<never> {
  return {
    ok: false,
    error: {
      code,
      message: message ?? code,
    },
  };
}
