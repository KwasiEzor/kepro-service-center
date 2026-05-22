import {StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from "@sentry/react";
import {BrowserRouter} from 'react-router-dom';
import {I18nextProvider} from 'react-i18next';
import {ErrorBoundary} from './components/ErrorBoundary';
import {AuthProvider} from './contexts/AuthContext';
import {ThemeProvider} from './contexts/ThemeContext';
import App from './App.tsx';
import i18n from './i18n/config';
import './index.css';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-primary">Loading...</div>}>
                <App />
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </I18nextProvider>
    </ErrorBoundary>
  </StrictMode>,
);
