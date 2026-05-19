import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { config } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = config.apiUrl;
  return `${baseUrl}${url}`;
}

/**
 * Type-safe access for localized fields (e.g., nameEn, nameFr)
 */
export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  baseField: string,
  lang: string
): string {
  const capitalizedLang = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
  const fieldName = `${baseField}${capitalizedLang}`;
  return obj[fieldName] || obj[`${baseField}En`] || '';
}
