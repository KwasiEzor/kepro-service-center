import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
import GalleryManagement from './GalleryManagement';
import ServicesManagement from './ServicesManagement';
import FaqManagement from './FaqManagement';

interface Stats {
  quotesCount: number;
  contactsCount: number;
  usersCount: number;
  imagesCount: number;
}

type AdminView = 'overview' | 'quotes' | 'contacts' | 'gallery' | 'services' | 'faq' | 'users';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeView]); // Refresh stats when returning to overview

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
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('overview')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Logo size="md" showSubtitle={false} />
              <span className="px-2 py-1 bg-brand-red/20 text-brand-red text-xs font-semibold rounded">
                ADMIN
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
              <p className="text-xs text-white/60">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
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
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        )}

        {activeView === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-brand-red" />
                Admin Dashboard
              </h1>
              <p className="text-white/60">Manage your website content and users</p>
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
                <h3 className="text-white/60 text-sm">Total Quotes</h3>
              </button>

              <button 
                onClick={() => setActiveView('contacts')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.contactsCount || 0}</span>
                </div>
                <h3 className="text-white/60 text-sm">Contacts</h3>
              </button>

              <button 
                onClick={() => setActiveView('gallery')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <Image className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.imagesCount || 0}</span>
                </div>
                <h3 className="text-white/60 text-sm">Images</h3>
              </button>

              <button 
                onClick={() => setActiveView('users')}
                className="card-dark p-6 text-left hover:border-brand-red/50 transition-all group opacity-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold">{stats?.usersCount || 0}</span>
                </div>
                <h3 className="text-white/60 text-sm">Users</h3>
              </button>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveView('gallery')}
                className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <Image className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  Gallery Management
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Upload, organize, and manage images
                </p>
                <span className="text-sm text-brand-red">Access Gallery →</span>
              </div>

              <div 
                onClick={() => setActiveView('quotes')}
                className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <FileText className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  Quote Requests
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Manage and respond to quote requests
                </p>
                <span className="text-sm text-brand-red">View Requests →</span>
              </div>

              <div 
                onClick={() => setActiveView('contacts')}
                className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <MessageSquare className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  Contact Messages
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  View and reply to customer messages
                </p>
                <span className="text-sm text-brand-red">View Messages →</span>
              </div>

              <div 
                onClick={() => setActiveView('services')}
                className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <Settings className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  Services Management
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Add, edit, and manage services
                </p>
                <span className="text-sm text-brand-red">Manage Services →</span>
              </div>

              <div 
                onClick={() => setActiveView('faq')}
                className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <HelpCircle className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
                  FAQ Management
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Manage frequently asked questions
                </p>
                <span className="text-sm text-brand-red">Manage FAQ →</span>
              </div>

              <div className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group opacity-50">
                <Users className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  User Management
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Manage users and permissions
                </p>
                <span className="text-sm text-brand-red">Coming Soon</span>
              </div>
            </div>
          </>
        )}

        {activeView === 'quotes' && <QuotesTable />}
        {activeView === 'contacts' && <ContactsTable />}
        {activeView === 'gallery' && <GalleryManagement />}
        {activeView === 'services' && <ServicesManagement />}
        {activeView === 'faq' && <FaqManagement />}
        
        {['users'].includes(activeView) && (
          <div className="text-center py-40">
            <h2 className="text-4xl font-bold mb-4 capitalize">{activeView} Management</h2>
            <p className="text-white/40 text-lg">This section is currently under construction.</p>
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
