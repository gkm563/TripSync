/**
 * Security & Input Sanitization Utilities for TripSync Web App
 * Prevents XSS, DOM injection, and payload tampering.
 */

export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  let clean = input.trim();
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  clean = clean.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return clean;
}

export function sanitizeAmount(amount: number | string): number {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num) || !isFinite(num) || num <= 0) return 0;
  return Math.round(num * 100) / 100;
}

export function isValidUpiId(upi: string): boolean {
  if (!upi) return false;
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upi.trim());
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
