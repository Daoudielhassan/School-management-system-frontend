'use client';

import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MapPin } from 'lucide-react';
import type { WeekSchedule } from '../types';

export interface WeekScheduleGridProps {
  weekStart: string;
  schedule?: WeekSchedule;
  instructorNames: Record<string, string>;
  isLoading?: boolean;
}

export function WeekScheduleGrid({ weekStart, schedule, instructorNames, isLoading }: WeekScheduleGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(parseISO(weekStart), i));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const sessions = (schedule?.[key] ?? [])
          .slice()
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
        const isToday = format(new Date(), 'yyyy-MM-dd') === key;

        return (
          <Card key={key} className={isToday ? 'border-blue-300 ring-1 ring-blue-200' : undefined}>
            <CardContent className="p-4">
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {format(day, 'EEEE', { locale: fr })}
                </p>
                <p className="text-sm font-semibold text-slate-700">{format(day, 'dd MMM', { locale: fr })}</p>
              </div>

              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">—</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="rounded-xl bg-blue-50/60 border border-blue-100 p-2.5">
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {session.teachingAssignmentId
                          ? instructorNames[session.teachingAssignmentId] ?? 'Cours'
                          : 'Cours'}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(session.startsAt), 'HH:mm')}–{format(new Date(session.endsAt), 'HH:mm')}
                      </div>
                      {session.room && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {session.room}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
