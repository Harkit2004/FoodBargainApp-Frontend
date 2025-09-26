/**
 * Price utilities to handle currency conversions with precision
 * Avoids floating-point arithmetic issues when converting between dollars and cents
 */

/**
 * Converts a price string (e.g., "12.95") to cents (e.g., 1295)
 * Handles edge cases and avoids floating-point precision issues
 * @param priceString - Price as string (e.g., "12.95", "5", "0.50")
 * @returns Price in cents as integer
 */
export const priceToCents = (priceString: string): number => {
  const cleanValue = priceString.trim();
  
  if (cleanValue === '' || cleanValue === '.') {
    return 0;
  }
  
  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue) || numericValue < 0) {
    return 0;
  }
  
  // Use string manipulation to avoid floating-point precision issues
  const dollarsParts = cleanValue.split('.');
  const dollars = parseInt(dollarsParts[0] || '0');
  const cents = dollarsParts[1] ? parseInt(dollarsParts[1].padEnd(2, '0').substring(0, 2)) : 0;
  
  return dollars * 100 + cents;
};

/**
 * Converts cents to a price string with proper formatting
 * @param cents - Price in cents (e.g., 1295)
 * @returns Formatted price string (e.g., "12.95")
 */
export const centsToPrice = (cents: number): string => {
  if (cents < 0) {
    return '0.00';
  }
  
  const dollars = Math.floor(cents / 100);
  const remainingCents = cents % 100;
  
  return `${dollars}.${remainingCents.toString().padStart(2, '0')}`;
};

/**
 * Formats a price in cents for display with currency symbol
 * @param cents - Price in cents
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted price string (e.g., "$12.95")
 */
export const formatPrice = (cents: number, currency: string = '$'): string => {
  return `${currency}${centsToPrice(cents)}`;
};

/**
 * Validates if a price string is valid
 * @param priceString - Price string to validate
 * @returns true if valid, false otherwise
 */
export const isValidPrice = (priceString: string): boolean => {
  const cleanValue = priceString.trim();
  
  if (cleanValue === '' || cleanValue === '.') {
    return false;
  }
  
  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue) || numericValue < 0) {
    return false;
  }
  
  // Check if it has more than 2 decimal places
  const decimalParts = cleanValue.split('.');
  if (decimalParts.length > 2) {
    return false;
  }
  
  if (decimalParts.length === 2 && decimalParts[1].length > 2) {
    return false;
  }
  
  return true;
};

/**
 * Rounds a price in cents to the nearest valid cent value
 * Useful for handling any remaining floating-point issues
 * @param cents - Price in cents (may be float)
 * @returns Rounded price in cents as integer
 */
export const roundCents = (cents: number): number => {
  return Math.round(cents);
};