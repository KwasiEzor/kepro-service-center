import React from 'react';
import { LogOut } from 'lucide-react';
import { Logo } from '../Logo';
import { useTranslation } from 'react-i18next';
import { User } from '../../types';

interface AdminHeaderProps {
  user: User | null;
  onLogout: () => void;
  onLogoClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onLogout, onLogoClick }) => {
  const { t } = useTranslation();

  return (
    <header className="border-b border-border-primary bg-bg-primary/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" showSubtitle={false} />
            <span className="px-2 py-1 bg-brand-red/20 text-brand-red text-xs font-semibold rounded">
              {t('dashboard.admin.badge')}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
            <p className="text-xs text-text-secondary">{t('common.admin')}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
            title={t('common.logout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
