/**
 * Date utilities to handle date formatting consistently across the app
 * and avoid timezone issues when working with date-only values from backend
 */

/**
 * Formats a date string (YYYY-MM-DD) for display, avoiding timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Additional formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {}
): string => {
  // Parse the date parts directly to avoid timezone conversion
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

/**
 * Formats a date string for long display (e.g., "October 4, 2025")
 */
export const formatDateLong = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formats a date string for short display (e.g., "10/4/2025")
 */
export const formatDateShort = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
};

/**
 * Gets the current date in YYYY-MM-DD format for date inputs
 */
export const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Validates if a date string is in correct YYYY-MM-DD format
 */
export const isValidDateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString + 'T00:00:00.000Z');
  return !isNaN(date.getTime());
};