'use client';

import { useAuth } from '@/context/AuthContext';
import { AddManagerPanel, ManagerDirectory } from '@/features/managers/components';

export default function AdminManagersPage() {
  const { token, isAuthenticated } = useAuth();

  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication…</p>
          {!isAuthenticated && (
            <p className="text-red-600 mt-2">Please log in to access this page.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          Gestion des managers
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Provisionnement et gestion des comptes manager
        </p>
      </div>
      <AddManagerPanel />
      <ManagerDirectory />
    </div>
  );
}
