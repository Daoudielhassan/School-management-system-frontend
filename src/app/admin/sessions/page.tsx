'use client';

import { Calendar } from 'lucide-react';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { SessionScheduleManager } from '@/features/sessions/components';

export default function AdminSessionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Calendar}
        title="Sessions"
        description="Planification et gestion des séances de cours"
      />
      <SessionScheduleManager />
    </div>
  );
}
