'use client';

import { SessionScheduleManager } from '@/features/sessions/components';

export default function AdminSessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des sessions</h1>
        <p className="text-gray-600">Planification et gestion des sessions de cours</p>
      </div>
      <SessionScheduleManager />
    </div>
  );
}
