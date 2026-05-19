import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import ChatBot from './ChatBot';
import { Logo } from './Logo';

export default function Layout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen gradient-bg selection:bg-[var(--color-brand-orange-primary)]/30 selection:text-white relative overflow-x-hidden">
      {/* Global Automotive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Main Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-brand-orange-primary)]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[var(--color-brand-orange-secondary)]/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Automotive Grid Overlay */}
        <div className="absolute inset-0 automotive-grid opacity-20" />
      </div>

      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 sm:px-12 border-t border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Logo size="md" showSubtitle={false} />
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('footer.services.title')}</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.services.keyProgramming')}</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.services.diagnostics')}</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.services.ecuRemap')}</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.services.lockout')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('footer.company.title')}</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.company.about')}</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.company.serviceArea')}</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.company.privacy')}</a></li>
              <li><a href="#" className="hover:text-[var(--color-brand-orange-primary)] transition-colors">{t('footer.company.terms')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('footer.support.title')}</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[var(--color-brand-orange-primary)] rounded-full shadow-[0_0_10px_var(--color-brand-orange-primary)]" />
                {t('footer.support.emergency')}
              </li>
              <li>{t('contact.contactInfo.support.value')}</li>
              <li>{t('footer.support.schedule')}</li>
            </ul>
          </div>
        </div>        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-white/20">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-8">
            <a href="#">{t('footer.social.instagram')}</a>
            <a href="#">{t('footer.social.facebook')}</a>
            <a href="#">{t('footer.social.linkedin')}</a>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
