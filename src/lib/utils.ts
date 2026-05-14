import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
  return `${baseUrl}${url}`;
}
