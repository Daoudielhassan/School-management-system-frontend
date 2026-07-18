'use client';

import { ClipboardList, Award, MessageSquare, Bell } from 'lucide-react';
import { StatTile } from '@/components/shared/StatTile';
import type { AttendanceSummary, GradeSummary } from '../types';

export interface DashboardStatCardsProps {
  attendance: AttendanceSummary;
  grades: GradeSummary;
  unreadMessages: number;
  unreadNotifications: number;
}

export function DashboardStatCards({
  attendance,
  grades,
  unreadMessages,
  unreadNotifications,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="sm:col-span-2 lg:col-span-1">
        <StatTile label="Moyenne générale" value={`${grades.averagePercent}%`} icon={Award} emphasis />
      </div>
      <StatTile label="Taux de présence" value={`${attendance.attendanceRatePercent}%`} icon={ClipboardList} />
      <StatTile label="Messages non lus" value={unreadMessages} icon={MessageSquare} />
      <StatTile label="Notifications non lues" value={unreadNotifications} icon={Bell} />
    </div>
  );
}
