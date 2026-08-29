import { randomBytes } from 'crypto';

export function generateOrderCode(): string {
  // Format: PW-XXXX-XXXX (uppercase alphanumeric, no ambiguous chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len: number) =>
    Array.from(randomBytes(len), (b) => chars[b % chars.length]).join('');
  return `PW-${segment(4)}-${segment(4)}`;
}
