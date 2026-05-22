import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, 
  FileText, 
  MessageSquare, 
  Image, 
  Users, 
  Settings, 
  Loader2,
  LayoutDashboard,
  ChevronLeft,
  HelpCircle
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { api } from '../../lib/api';
import { ApiResponse } from '../../types';
import QuotesTable from './QuotesTable';
import ContactsTable from './ContactsTable';
import InvoicesTable from './InvoicesTable';
import GalleryManagement from './GalleryManagement';
import ServicesManagement from './ServicesManagement';
import FaqManagement from './FaqManagement';
import UsersManagement from './UsersManagement';

interface Stats {
  quotesCount: number;
  contactsCount: number;
  usersCount: number;
  imagesCount: number;
  invoicesCount?: number;
}

type AdminView = 'overview' | 'quotes' | 'contacts' | 'invoices' | 'gallery' | 'services' | 'faq' | 'users';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<ApiResponse<Stats>>('/api/admin/stats');
        if (response.data.data) {
          setStats(response.data.data);
        }
      } catch (error: any) {
        const message = error.response?.data?.error || 'Failed to load statistics';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch stats when viewing overview
    if (activeView === 'overview') {
      fetchStats();
    }
  }, [activeView]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading && activeView === 'overview') {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-primary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('overview')}
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
              onClick={handleLogout}
              className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              title={t('common.logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeView !== 'overview' && (
          <button
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('dashboard.admin.back')}
          </button>
        )}

        {activeView === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-brand-red" />
                {t('dashboard.admin.title')}
              </h1>
              <p className="text-text-secondary">{t('dashboard.admin.subtitle')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <button 
                onClick={() => setActiveView('quotes')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.quotesCount || 0}</span>
                </div>
                <h3 className="text-text-secondary text-sm">{t('dashboard.admin.stats.quotes')}</h3>
              </button>

              <button
                onClick={() => setActiveView('contacts')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.contactsCount || 0}</span>
                </div>
                <h3 className="text-text-secondary text-sm">{t('dashboard.admin.stats.contacts')}</h3>
              </button>

              <button
                onClick={() => setActiveView('invoices')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-[var(--color-brand-orange-primary)] group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.invoicesCount || 0}</span>
                </div>
                <h3 className="text-text-secondary text-sm">{t('dashboard.admin.stats.invoices')}</h3>
              </button>

              <button
                onClick={() => setActiveView('gallery')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <Image className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.imagesCount || 0}</span>
                </div>
                <h3 className="text-text-secondary text-sm">{t('dashboard.admin.stats.gallery')}</h3>
              </button>

              <button 
                onClick={() => setActiveView('users')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group md:col-start-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.usersCount || 0}</span>
                </div>
                <h3 className="text-text-secondary text-sm">{t('dashboard.admin.stats.users')}</h3>
              </button>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveView('gallery')}
                className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
              >
                <Image className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  {t('dashboard.admin.sections.gallery.title')}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('dashboard.admin.sections.gallery.desc')}
                </p>
                <span className="text-sm text-brand-red">{t('dashboard.admin.sections.gallery.action')} →</span>
              </div>

              <div
                onClick={() => setActiveView('invoices')}
                className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
              >
                <FileText className="w-10 h-10 text-[var(--color-brand-orange-primary)] mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--color-brand-orange-primary)] transition-colors">
                  {t('dashboard.admin.sections.invoices.title')}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('dashboard.admin.sections.invoices.desc')}
                </p>
                <span className="text-sm text-[var(--color-brand-orange-primary)]">{t('dashboard.admin.sections.invoices.action')} →</span>
              </div>

              <div
                onClick={() => setActiveView('quotes')}
                className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
              >
                <FileText className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  {t('dashboard.admin.sections.quotes.title')}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('dashboard.admin.sections.quotes.desc')}
                </p>
                <span className="text-sm text-brand-red">{t('dashboard.admin.sections.quotes.action')} →</span>
              </div>

              <div 
                onClick={() => setActiveView('contacts')}
                className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
              >
                <MessageSquare className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  {t('dashboard.admin.sections.contacts.title')}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('dashboard.admin.sections.contacts.desc')}
                </p>
                <span className="text-sm text-brand-red">{t('dashboard.admin.sections.contacts.action')} →</span>
              </div>

              <div 
                onClick={() => setActiveView('services')}
                className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
              >
                <Settings className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  {t('dashboard.admin.sections.services.title')}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('dashboard.admin.sections.services.desc')}
                </p>
                <span className="text-sm text-brand-red">{t('dashboard.admin.sections.services.action')} →</span>
              </div>

              <div 
                onClick={() => setActiveView('faq')}
                className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
              >
                <HelpCircle className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  {t('dashboard.admin.sections.faq.title')}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('dashboard.admin.sections.faq.desc')}
                </p>
                <span className="text-sm text-brand-red">{t('dashboard.admin.sections.faq.action')} →</span>
              </div>

              <div 
                onClick={() => setActiveView('users')}
                className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
              >
                <Users className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  {t('dashboard.admin.sections.users.title')}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('dashboard.admin.sections.users.desc')}
                </p>
                <span className="text-sm text-brand-red">{t('dashboard.admin.sections.users.action')} →</span>
              </div>
            </div>
          </>
        )}

        {activeView === 'quotes' && <QuotesTable />}
        {activeView === 'contacts' && <ContactsTable />}
        {activeView === 'invoices' && <InvoicesTable />}
        {activeView === 'gallery' && <GalleryManagement />}
        {activeView === 'services' && <ServicesManagement />}
        {activeView === 'faq' && <FaqManagement />}
        {activeView === 'users' && <UsersManagement />}
        
        {[''].includes(activeView) && (
          <div className="text-center py-40">
            <h2 className="text-4xl font-bold mb-4 capitalize">{activeView} Management</h2>
            <p className="text-text-tertiary text-lg">This section is currently under construction.</p>
            <button 
              onClick={() => setActiveView('overview')}
              className="mt-8 px-8 py-3 bg-brand-red text-white font-bold clip-angular-sm hover:scale-105 transition-transform"
            >
              Back to Overview
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
