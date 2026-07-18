'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, Building2, CalendarClock, MessageSquare } from 'lucide-react';

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
  const cards = [
    { icon: ClipboardCheck, value: pendingValidations, label: 'Justificatifs en attente' },
    { icon: Building2, value: classGroupsCount, label: 'Classes du département' },
    { icon: CalendarClock, value: todaySessionsCount, label: "Sessions aujourd'hui" },
    { icon: MessageSquare, value: unreadMessages, label: 'Messages non lus' },
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
