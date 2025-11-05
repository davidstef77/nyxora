/**
 * Sanitize text to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize slug to prevent NoSQL injection
 * Allows only alphanumeric characters, hyphens, and underscores
 */
export function sanitizeSlug(slug, maxLength = 200) {
  if (!slug || typeof slug !== 'string') return null;
  if (slug.length > maxLength) return null;
  
  const sanitized = String(slug).replace(/[^a-zA-Z0-9-_]/g, '');
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Sanitize array of slugs/IDs for database queries
 * Ensures all items are valid strings
 */
export function sanitizeArray(arr, maxLength = 200) {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .filter(item => item && typeof item === 'string' && item.length <= maxLength)
    .map(item => String(item).replace(/[^a-zA-Z0-9-_]/g, ''))
    .filter(item => item.length > 0);
}

/**
 * Sanitize JSON-LD data to prevent XSS in structured data
 */
export function sanitizeJsonLd(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJsonLd(item));
  }
  
  const sanitized = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeJsonLd(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
