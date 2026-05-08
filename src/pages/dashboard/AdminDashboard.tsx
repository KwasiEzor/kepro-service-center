import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, MessageSquare, Image, Users, Settings } from 'lucide-react';

export default function AdminDashboard() {
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center p-2">
              <div className="w-full h-full bg-white/20 rounded-sm" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">KEYPRO</span>
            <span className="px-2 py-1 bg-brand-red/20 text-brand-red text-xs font-semibold rounded">
              ADMIN
            </span>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-white/60">Manage your website content and users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-brand-red" />
              <span className="text-3xl font-bold">0</span>
            </div>
            <h3 className="text-white/60 text-sm">Total Quotes</h3>
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-brand-red" />
              <span className="text-3xl font-bold">0</span>
            </div>
            <h3 className="text-white/60 text-sm">Contacts</h3>
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <Image className="w-8 h-8 text-brand-red" />
              <span className="text-3xl font-bold">0</span>
            </div>
            <h3 className="text-white/60 text-sm">Images</h3>
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-brand-red" />
              <span className="text-3xl font-bold">2</span>
            </div>
            <h3 className="text-white/60 text-sm">Users</h3>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group">
            <Image className="w-10 h-10 text-brand-red mb-4" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
              Gallery Management
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Upload, organize, and manage images
            </p>
            <span className="text-sm text-brand-red">Coming Soon →</span>
          </div>

          <div className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group">
            <FileText className="w-10 h-10 text-brand-red mb-4" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
              Quote Requests
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Manage and respond to quote requests
            </p>
            <span className="text-sm text-brand-red">Coming Soon →</span>
          </div>

          <div className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group">
            <MessageSquare className="w-10 h-10 text-brand-red mb-4" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
              Contact Messages
            </h3>
            <p className="text-white/60 text-sm mb-4">
              View and reply to customer messages
            </p>
            <span className="text-sm text-brand-red">Coming Soon →</span>
          </div>

          <div className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group">
            <Settings className="w-10 h-10 text-brand-red mb-4" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
              Services Management
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Add, edit, and manage services
            </p>
            <span className="text-sm text-brand-red">Coming Soon →</span>
          </div>

          <div className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group">
            <MessageSquare className="w-10 h-10 text-brand-red mb-4" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
              FAQ Management
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Manage frequently asked questions
            </p>
            <span className="text-sm text-brand-red">Coming Soon →</span>
          </div>

          <div className="card-dark p-6 hover:bg-white/5 transition-colors cursor-pointer group">
            <Users className="w-10 h-10 text-brand-red mb-4" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors">
              User Management
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Manage users and permissions
            </p>
            <span className="text-sm text-brand-red">Coming Soon →</span>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="mt-8 p-6 bg-brand-red/10 border border-brand-red/20 rounded-lg">
          <h3 className="font-semibold mb-2">🚧 Implementation in Progress</h3>
          <p className="text-sm text-white/80">
            Admin features are being built. The complete CMS with gallery, content management, and user administration will be available soon.
          </p>
        </div>
      </main>
    </div>
  );
}
