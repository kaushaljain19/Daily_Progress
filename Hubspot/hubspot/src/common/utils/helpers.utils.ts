

/**
 * Safely convert value to string or return empty string
 */
export const safeString = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  return String(value).trim();
};

/**
 * Safely convert value to string array
 */
export const safeArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => v).map(v => String(v));
  return [String(value)];
};

/**
 * Convert timestamp to ISO date string
 */
export const toISODate = (timestamp: any): string => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? '' : date.toISOString();
  } catch {
    return '';
  }
};
