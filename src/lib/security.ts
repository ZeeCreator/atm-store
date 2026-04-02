/**
 * Security Utilities for ATM Store
 * Protect against XSS, injection attacks, and data validation
 */

// Sanitize HTML to prevent XSS attacks
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Sanitize user input - remove potentially dangerous characters
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Indonesian format)
// Accepts: 081234567890, 6281234567890, +6281234567890, 0881026356541
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indonesian phone patterns:
  // 08xx (10-13 digits)
  // 628xx (11-14 digits)  
  // +628xx (12-15 digits)
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
  
  return phoneRegex.test(cleaned);
}

// Validate URL format
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate Instagram URL
export function validateInstagramURL(url: string): boolean {
  const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+\/?$/;
  return instagramRegex.test(url);
}

// Validate number range
export function validateNumberRange(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}

// Validate price (positive number)
export function validatePrice(price: number): boolean {
  return validateNumberRange(price, 0, 1000000000); // Max 1 billion
}

// Validate stock quantity
export function validateStock(stock: number): boolean {
  return validateNumberRange(stock, 0, 10000); // Max 10k items
}

// Validate discount percentage
export function validateDiscount(discount: number): boolean {
  return validateNumberRange(discount, 0, 100);
}

// Escape special characters for safe display
export function escapeHTML(str: string): string {
  const escapeChars: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => escapeChars[char]);
}

// Generate CSRF-like token (simple implementation)
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + 
         Date.now().toString(36);
}

// Validate token format
export function validateToken(token: string): boolean {
  return typeof token === 'string' && token.length >= 20;
}

// Rate limiter helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
}

// Create global rate limiter instance
export const globalRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

// Validate product data
export function validateProductData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (data.name.length > 200) {
    errors.push('Product name must be less than 200 characters');
  }
  
  if (!validatePrice(data.price)) {
    errors.push('Invalid price');
  }
  
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }
  
  if (!data.brand || data.brand.trim().length === 0) {
    errors.push('Brand is required');
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (data.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }
  
  if (!validateStock(data.stock)) {
    errors.push('Invalid stock quantity');
  }
  
  if (!Array.isArray(data.images) || data.images.length === 0) {
    errors.push('At least one image is required');
  }
  
  if (data.isFlashSale) {
    if (!validatePrice(data.flashSalePrice)) {
      errors.push('Invalid flash sale price');
    }
    
    if (!validateDiscount(data.discount)) {
      errors.push('Invalid discount percentage');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate settings data
export function validateSettingsData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.username || data.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (!validatePhone(data.whatsappNumber)) {
    errors.push('Invalid WhatsApp number format');
  }
  
  if (!data.storeName || data.storeName.trim().length === 0) {
    errors.push('Store name is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Security headers helper (for API routes)
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
