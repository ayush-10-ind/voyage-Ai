/**
 * Application-wide utility helper functions and formatting methods.
 */

/**
 * Pixel breakpoint values for responsive designs in JS/TS files.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Shared animation transition configurations for Framer Motion.
 */
export const MOTION_TRANSITIONS = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  easeOut: {
    type: "tween" as const,
    ease: [0.16, 1, 0.3, 1], // easeOutExpo
    duration: 0.6,
  },
  easeInOut: {
    type: "tween" as const,
    ease: [0.87, 0, 0.13, 1], // easeInOutExpo
    duration: 0.8,
  },
} as const;

/**
 * Format a number as currency.
 */
export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format a date string or object into a human-readable format.
 */
export function formatDate(date: string | Date | number, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date range (e.g., "Oct 12 – Oct 18, 2026").
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string, locale = "en-US"): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = start.getMonth() === end.getMonth();

  const startFormatted = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(start);

  const endFormatted = new Intl.DateTimeFormat(locale, {
    month: sameMonth ? "numeric" : "short",
    day: "numeric",
  }).format(end);

  const yearFormatted = new Intl.DateTimeFormat(locale, {
    year: "numeric",
  }).format(end);

  return `${startFormatted} – ${endFormatted}, ${yearFormatted}`;
}

/**
 * Debounce function to limit execution frequency.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
