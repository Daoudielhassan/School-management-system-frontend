'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Bell, Star, Archive } from 'lucide-react';
import type { MessageResponse } from '../types';

export function MessageStatsCards({
  messages,
  unreadCount,
}: {
  messages: MessageResponse[];
  unreadCount?: number;
}) {
  const cards = [
    { icon: MessageSquare, value: messages.length, label: 'In this view', color: 'text-blue-600', border: 'border-blue-200 hover:border-blue-300', labelColor: 'text-blue-600' },
    { icon: Bell, value: unreadCount ?? 0, label: 'Unread', color: 'text-indigo-600', border: 'border-indigo-200 hover:border-indigo-300', labelColor: 'text-indigo-600' },
    { icon: Star, value: messages.filter((m) => m.starred).length, label: 'Starred', color: 'text-yellow-600', border: 'border-yellow-200 hover:border-yellow-300', labelColor: 'text-yellow-600' },
    { icon: Archive, value: messages.filter((m) => m.archived).length, label: 'Archived', color: 'text-gray-600', border: 'border-gray-200 hover:border-gray-300', labelColor: 'text-gray-600' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map(({ icon: Icon, value, label, color, border, labelColor }) => (
        <Card key={label} className={`bg-white/80 backdrop-blur-md ${border} transition-all duration-300 group shadow-lg`}>
          <CardContent className="p-6 text-center">
            <Icon className={`h-8 w-8 ${color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className={`text-sm ${labelColor}`}>{label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
