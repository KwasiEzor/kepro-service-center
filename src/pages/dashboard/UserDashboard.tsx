import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, MessageSquare } from 'lucide-react';
import { Logo } from '../../components/Logo';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" showSubtitle={false} />

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
              <p className="text-xs text-white/60">User Dashboard</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-white/60">Manage your services and requests</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-brand-red" />
              <span className="text-3xl font-bold">0</span>
            </div>
            <h3 className="text-white/60 text-sm">Active Quotes</h3>
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-brand-red" />
              <span className="text-3xl font-bold">0</span>
            </div>
            <h3 className="text-white/60 text-sm">Messages</h3>
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <User className="w-8 h-8 text-brand-red" />
              <span className="text-3xl font-bold">Active</span>
            </div>
            <h3 className="text-white/60 text-sm">Account Status</h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-dark p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/quote')}
              className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors group"
            >
              <FileText className="w-8 h-8 text-brand-red mb-3" />
              <h3 className="font-semibold mb-1 group-hover:text-brand-red transition-colors">
                Request Quote
              </h3>
              <p className="text-sm text-white/60">Get a quote for your vehicle service</p>
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors group"
            >
              <MessageSquare className="w-8 h-8 text-brand-red mb-3" />
              <h3 className="font-semibold mb-1 group-hover:text-brand-red transition-colors">
                Contact Support
              </h3>
              <p className="text-sm text-white/60">Get help from our team</p>
            </button>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 p-6 bg-brand-red/10 border border-brand-red/20 rounded-lg">
          <p className="text-center text-white/80">
            <strong>🚧 Dashboard under construction</strong> - Full features coming soon: quote history, service tracking, and more!
          </p>
        </div>
      </main>
    </div>
  );
}
