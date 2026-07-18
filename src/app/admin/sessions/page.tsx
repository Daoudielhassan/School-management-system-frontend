'use client';

import { Calendar } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SessionScheduleManager } from '@/features/sessions/components';

export default function AdminSessionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="Sessions"
        description="Planification et gestion des séances de cours"
      />
      <SessionScheduleManager />
    </div>
  );
}
