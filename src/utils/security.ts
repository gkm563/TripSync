/**
 * Security & Input Sanitization Utilities for TripSync
 * Provides defense-in-depth against XSS, script injection, and invalid payload formats.
 */

/**
 * Sanitizes string input to prevent script injection and HTML tag execution.
 * Trims whitespace and strips dangerous tags/characters.
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  
  // Trim leading/trailing whitespace
  let clean = input.trim();
  
  // Truncate to maximum allowed length
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  
  // Strip HTML/Script tag delimiters
  clean = clean.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return clean;
}

/**
 * Sanitizes numeric amount inputs to ensure strict positive numbers with at most 2 decimal places.
 */
export function sanitizeAmount(amount: number | string): number {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num) || !isFinite(num) || num <= 0) return 0;
  return Math.round(num * 100) / 100;
}

/**
 * Validates UPI ID format (e.g. user@bank, phone@upi).
 */
export function isValidUpiId(upi: string): boolean {
  if (!upi) return false;
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upi.trim());
}

/**
 * Validates email address format.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
