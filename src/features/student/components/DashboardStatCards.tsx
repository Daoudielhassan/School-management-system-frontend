'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Award, MessageSquare, Bell } from 'lucide-react';
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
  const cards = [
    {
      icon: ClipboardList,
      value: `${attendance.attendanceRatePercent}%`,
      label: 'Taux de présence',
    },
    {
      icon: Award,
      value: `${grades.averagePercent}%`,
      label: 'Moyenne générale',
    },
    {
      icon: MessageSquare,
      value: unreadMessages,
      label: 'Messages non lus',
    },
    {
      icon: Bell,
      value: unreadNotifications,
      label: 'Notifications non lues',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ icon: Icon, value, label }) => (
        <Card key={label} className="hover:border-blue-300 transition-all duration-300 group">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
              <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
