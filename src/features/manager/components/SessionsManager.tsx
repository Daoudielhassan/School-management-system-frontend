'use client';

import { Calendar } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SessionScheduleBoard } from './SessionScheduleBoard';

export function SessionsManager() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="Sessions"
        description="Planning des séances de votre département — glissez-déposez pour reprogrammer"
      />
      <SessionScheduleBoard />
    </div>
  );
}
