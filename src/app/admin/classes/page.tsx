'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClassesManager } from '@/features/classes/components';

/** Reads `?q=` (from the global search) — isolated so only this leaf opts into `useSearchParams`. */
function ClassesManagerWithSearch() {
  const searchParams = useSearchParams();
  return <ClassesManager initialSearch={searchParams.get('q') ?? undefined} />;
}

export default function AdminClassesPage() {
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
    <Suspense fallback={null}>
      <ClassesManagerWithSearch />
    </Suspense>
  );
}
