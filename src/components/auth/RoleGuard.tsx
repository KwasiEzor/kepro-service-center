import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== requiredRole) {
    // User doesn't have required role, redirect to appropriate page
    return <Navigate to={user ? '/dashboard' : '/login'} replace />;
  }

  return <>{children}</>;
};
