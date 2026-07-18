'use client';

import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { SessionCalendar, type SessionCalendarEvent } from '@/components/shared/SessionCalendar';
import { useMySessions, useMySessionDetails } from '../hooks/useMySchedule';
import { QueryErrorState } from './QueryErrorState';

export function MySchedule() {
  const { data: sessions = [], isLoading, isError, refetch } = useMySessions();
  const details = useMySessionDetails(sessions);

  const events: SessionCalendarEvent[] = useMemo(
    () =>
      sessions.map((s) => {
        const detail = details[s.teachingAssignmentId];
        return {
          id: s.id,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          title: detail?.subjectName ?? 'Séance',
          room: s.room,
          cancelled: s.status === 'CANCELLED',
          colorKey: s.teachingAssignmentId,
        };
      }),
    [sessions, details]
  );

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarDays} title="Mon emploi du temps" description="Toutes vos séances" />

      <Card>
        <CardContent className="p-6">
          {isError ? (
            <QueryErrorState message="Impossible de charger votre emploi du temps." onRetry={refetch} />
          ) : (
            <SessionCalendar events={events} isLoading={isLoading} emptyMessage="Aucune séance programmée" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
