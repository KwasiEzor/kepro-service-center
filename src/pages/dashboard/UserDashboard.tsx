import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  FileText, 
  Settings, 
  Loader2,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { api } from '../../lib/api';
import { ApiResponse } from '../../types';
import UserQuotes from './UserQuotes';
import UserProfile from './UserProfile';
import UserContacts from './UserContacts';
import UserInvoices from './UserInvoices';
import { MessageSquare } from 'lucide-react';

type UserView = 'overview' | 'quotes' | 'invoices' | 'profile' | 'messages';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<UserView>('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-primary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" showSubtitle={false} />
            <span className="px-2 py-1 bg-bg-secondary text-text-primary text-[10px] font-black tracking-widest rounded uppercase">
              Member
            </span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
              <p className="text-xs text-text-tertiary capitalize">{user?.role.toLowerCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
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
            className="flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        )}

        {activeView === 'overview' && (
          <>
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-black mb-4">
                Welcome back, <span className="text-brand-red">{user?.firstName || 'Valued Customer'}</span>
              </h1>
              <p className="text-text-tertiary text-lg">Track your service requests and manage your account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div
                onClick={() => setActiveView('quotes')}
                className="card-dark p-8 cursor-pointer group hover:border-brand-red/50 transition-all"
              >
                <div className="w-14 h-14 bg-brand-red/20 text-brand-red clip-angular-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-text-primary">Quote History</h2>
                <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
                  View your previous service requests, track their status, and see price estimations.
                </p>
                <span className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-brand-red">
                  View Quotes <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div
                onClick={() => setActiveView('invoices')}
                className="card-dark p-8 cursor-pointer group hover:border-[var(--color-brand-orange-primary)]/50 transition-all"
              >
                <div className="w-14 h-14 bg-[var(--color-brand-orange-primary)]/20 text-[var(--color-brand-orange-primary)] clip-angular-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-text-primary">Mes Factures</h2>
                <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
                  Consultez vos factures, téléchargez les PDF et suivez les paiements.
                </p>
                <span className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-[var(--color-brand-orange-primary)]">
                  Voir Factures <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div
                onClick={() => setActiveView('messages')}
                className="card-dark p-8 cursor-pointer group hover:border-brand-red/50 transition-all"
              >
                <div className="w-14 h-14 bg-blue-500/20 text-blue-500 clip-angular-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-text-primary">Messages</h2>
                <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
                  Track your support inquiries and view direct replies from our technical team.
                </p>
                <span className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-blue-500">
                  Open Inbox <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div 
                onClick={() => setActiveView('profile')}
                className="card-dark p-8 cursor-pointer group hover:border-brand-red/50 transition-all"
              >
                <div className="w-14 h-14 bg-bg-secondary text-text-primary clip-angular-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserIcon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-text-primary">Profile</h2>
                <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
                  Update your contact information and preferences to help us serve you better.
                </p>
                <span className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-text-secondary">
                  Manage Account <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 p-8 bg-gradient-to-r from-brand-red to-orange-600 clip-angular-lg flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                 <h3 className="text-2xl font-black text-text-primary mb-2 uppercase tracking-tighter">Need a new service?</h3>
                 <p className="text-text-secondary font-bold">Get a precise technical quote in under 30 minutes.</p>
              </div>
              <button 
                onClick={() => navigate('/quote')}
                className="px-10 py-4 bg-bg-tertiary text-brand-red font-black text-lg clip-angular-sm hover:scale-105 transition-transform"
              >
                REQUEST QUOTE
              </button>
            </div>
          </>
        )}

        {activeView === 'quotes' && <UserQuotes />}
        {activeView === 'invoices' && <UserInvoices />}
        {activeView === 'messages' && <UserContacts />}
        {activeView === 'profile' && <UserProfile />}
      </main>
    </div>
  );
}
