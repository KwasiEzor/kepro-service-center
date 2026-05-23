import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
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
import { api } from '../../lib/api';
import { ApiResponse } from '../../types';
import QuotesTable from './QuotesTable';
import ContactsTable from './ContactsTable';
import InvoicesTable from './InvoicesTable';
import GalleryManagement from './GalleryManagement';
import ServicesManagement from './ServicesManagement';
import FaqManagement from './FaqManagement';
import UsersManagement from './UsersManagement';
import { RevenueChart } from './RevenueChart';
import { ServiceDistributionChart } from './ServiceDistributionChart';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickAccessCard } from '../../components/dashboard/QuickAccessCard';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { AdminHeader } from '../../components/dashboard/AdminHeader';

interface Stats {
  quotesCount: number;
  contactsCount: number;
  usersCount: number;
  imagesCount: number;
  invoicesCount: number;
  totalRevenue: number;
  revenueChart: Array<{ name: string; total: number }>;
  serviceDistribution: Array<{ name: string; value: number }>;
  recentActivity: Array<{
    type: 'QUOTE' | 'CONTACT' | 'INVOICE';
    id: string;
    title: string;
    user: string;
    date: string;
    status: string;
  }>;
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
      <AdminHeader 
        user={user} 
        onLogout={handleLogout} 
        onLogoClick={() => setActiveView('overview')} 
      />

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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
              <StatCard 
                label={t('dashboard.admin.stats.quotes')}
                value={stats?.quotesCount || 0}
                icon={FileText}
                onClick={() => setActiveView('quotes')}
              />

              <StatCard 
                label={t('dashboard.admin.stats.contacts')}
                value={stats?.contactsCount || 0}
                icon={MessageSquare}
                onClick={() => setActiveView('contacts')}
              />

              <StatCard 
                label={t('dashboard.admin.stats.invoices')}
                value={stats?.invoicesCount || 0}
                icon={FileText}
                variant="blue"
                onClick={() => setActiveView('invoices')}
              />

              <StatCard 
                label="Total Revenue"
                value={`€${(stats?.totalRevenue || 0).toLocaleString()}`}
                icon={FileText}
                variant="success"
              />

              <StatCard 
                label={t('dashboard.admin.stats.users')}
                value={stats?.usersCount || 0}
                icon={Users}
                onClick={() => setActiveView('users')}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="card-dark p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-tertiary mb-8">Monthly Revenue Trend</h3>
                <RevenueChart data={stats?.revenueChart || []} />
              </div>
              <div className="card-dark p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-tertiary mb-8">Service Distribution</h3>
                <ServiceDistributionChart data={stats?.serviceDistribution || []} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Management Sections */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-widest text-text-tertiary">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <QuickAccessCard 
                    title={t('dashboard.admin.sections.gallery.title')}
                    description={t('dashboard.admin.sections.gallery.desc')}
                    icon={Image}
                    actionText={t('dashboard.admin.sections.gallery.action')}
                    onClick={() => setActiveView('gallery')}
                  />

                  <QuickAccessCard 
                    title={t('dashboard.admin.sections.invoices.title')}
                    description={t('dashboard.admin.sections.invoices.desc')}
                    icon={FileText}
                    variant="blue"
                    actionText={t('dashboard.admin.sections.invoices.action')}
                    onClick={() => setActiveView('invoices')}
                  />

                  <QuickAccessCard 
                    title={t('dashboard.admin.sections.quotes.title')}
                    description={t('dashboard.admin.sections.quotes.desc')}
                    icon={FileText}
                    actionText={t('dashboard.admin.sections.quotes.action')}
                    onClick={() => setActiveView('quotes')}
                  />

                  <QuickAccessCard 
                    title={t('dashboard.admin.sections.contacts.title')}
                    description={t('dashboard.admin.sections.contacts.desc')}
                    icon={MessageSquare}
                    actionText={t('dashboard.admin.sections.contacts.action')}
                    onClick={() => setActiveView('contacts')}
                  />

                  <QuickAccessCard 
                    title={t('dashboard.admin.sections.services.title')}
                    description={t('dashboard.admin.sections.services.desc')}
                    icon={Settings}
                    actionText={t('dashboard.admin.sections.services.action')}
                    onClick={() => setActiveView('services')}
                  />

                  <QuickAccessCard 
                    title={t('dashboard.admin.sections.faq.title')}
                    description={t('dashboard.admin.sections.faq.desc')}
                    icon={HelpCircle}
                    actionText={t('dashboard.admin.sections.faq.action')}
                    onClick={() => setActiveView('faq')}
                  />

                  <QuickAccessCard 
                    title={t('dashboard.admin.sections.users.title')}
                    description={t('dashboard.admin.sections.users.desc')}
                    icon={Users}
                    actionText={t('dashboard.admin.sections.users.action')}
                    onClick={() => setActiveView('users')}
                  />
                </div>
              </div>

              {/* Recent Activity Feed */}
              <ActivityFeed activities={stats?.recentActivity || []} />
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
