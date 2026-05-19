/**
 * Centralized Configuration for KeyPro Frontend
 * All environment variables are accessed here with proper typing and fallbacks.
 */

interface Config {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  maxUploadSize: number;
}

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

export const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  isDevelopment,
  isProduction,
  maxUploadSize: 5 * 1024 * 1024, // 5MB default
};

export default config;
