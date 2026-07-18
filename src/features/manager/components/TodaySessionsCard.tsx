'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useSessionDetails } from '../hooks/useSessionDetails';
import type { SessionData } from '../types';

export function TodaySessionsCard({ sessions }: { sessions: SessionData[] }) {
  const details = useSessionDetails(sessions);

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
          <div className="text-center py-10 text-slate-400 text-sm">Aucune session aujourd&apos;hui</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((session) => {
              const detail = session.teachingAssignmentId ? details[session.teachingAssignmentId] : undefined;
              return (
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
                      {detail?.subjectName ?? 'Session'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{detail?.instructorName ?? '—'}</span>
                      {session.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.room}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
