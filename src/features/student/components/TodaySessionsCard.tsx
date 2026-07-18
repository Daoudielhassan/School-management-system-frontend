'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useInstructorNames } from '../hooks/useMySchedule';
import { toIsoDate } from '../lib/week';
import type { SessionData } from '@/features/sessions';

export function TodaySessionsCard({ sessions }: { sessions: SessionData[] }) {
  const todayKey = useMemo(() => toIsoDate(new Date()), []);
  const wrapped = useMemo(() => ({ [todayKey]: sessions }), [todayKey, sessions]);
  const instructorNames = useInstructorNames(wrapped);

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Aujourd&apos;hui
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Aucun cours aujourd&apos;hui</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex flex-col items-center justify-center w-16 flex-shrink-0 text-blue-600">
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">{format(new Date(session.startsAt), 'HH:mm')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {session.teachingAssignmentId
                      ? instructorNames[session.teachingAssignmentId] ?? 'Cours'
                      : 'Cours'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>
                      {format(new Date(session.startsAt), 'HH:mm')} – {format(new Date(session.endsAt), 'HH:mm')}
                    </span>
                    {session.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
