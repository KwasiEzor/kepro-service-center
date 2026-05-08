import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import ChatBot from './ChatBot';

export default function Layout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen gradient-bg selection:bg-brand-red selection:text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="py-20 px-6 sm:px-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center p-1.5">
                <div className="w-full h-full bg-white/20 rounded-sm" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">KEYPRO</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('footer.services.title')}</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.services.keyProgramming')}</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.services.diagnostics')}</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.services.ecuRemap')}</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.services.lockout')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('footer.company.title')}</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.company.about')}</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.company.serviceArea')}</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.company.privacy')}</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">{t('footer.company.terms')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('footer.support.title')}</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-brand-red rounded-full" />
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
