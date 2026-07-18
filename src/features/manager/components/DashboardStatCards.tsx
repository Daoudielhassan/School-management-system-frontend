'use client';

import { Building2, CalendarClock, MessageSquare, ClipboardCheck } from 'lucide-react';
import { StatTile } from '@/components/shared/StatTile';

export interface DashboardStatCardsProps {
  pendingValidations: number;
  classGroupsCount: number;
  todaySessionsCount: number;
  unreadMessages: number;
}

export function DashboardStatCards({
  pendingValidations,
  classGroupsCount,
  todaySessionsCount,
  unreadMessages,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="sm:col-span-2 lg:col-span-1">
        <StatTile label="Justificatifs en attente" value={pendingValidations} icon={ClipboardCheck} emphasis />
      </div>
      <StatTile label="Classes du département" value={classGroupsCount} icon={Building2} />
      <StatTile label="Sessions aujourd'hui" value={todaySessionsCount} icon={CalendarClock} />
      <StatTile label="Messages non lus" value={unreadMessages} icon={MessageSquare} />
    </div>
  );
}
