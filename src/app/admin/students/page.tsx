'use client';

import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { AddStudentPanel, StudentDirectory } from '@/features/students/components';

export default function AdminStudentsPage() {
  const { token, isAuthenticated } = useAuth();

  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Chargement…</p>
          {!isAuthenticated && (
            <p className="text-red-600 mt-2">Veuillez vous connecter pour accéder à cette page.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title="Étudiants"
        description="Ajout et gestion des étudiants du système"
      />
      <AddStudentPanel />
      <StudentDirectory />
    </div>
  );
}
