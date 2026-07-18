'use client';

import { useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useMySchedule } from '../hooks/useMySchedule';
import { getWeekStartIso } from '../lib/week';
import { WeekScheduleGrid } from './WeekScheduleGrid';
import { QueryErrorState } from './QueryErrorState';

export function MySchedule() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartIso());
  const { schedule, instructorNames, isLoading, isError, refetch } = useMySchedule(weekStart);

  const weekEnd = addDays(parseISO(weekStart), 6);
  const label = `${format(parseISO(weekStart), 'dd MMM', { locale: fr })} – ${format(weekEnd, 'dd MMM yyyy', { locale: fr })}`;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="Emploi du temps"
        description={<span className="capitalize">{label}</span>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart((w) => format(addDays(parseISO(w), -7), 'yyyy-MM-dd'))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(getWeekStartIso())}>
              Aujourd&apos;hui
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart((w) => format(addDays(parseISO(w), 7), 'yyyy-MM-dd'))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {isError ? (
        <QueryErrorState message="Impossible de charger l'emploi du temps." onRetry={refetch} />
      ) : (
        <WeekScheduleGrid
          weekStart={weekStart}
          schedule={schedule}
          instructorNames={instructorNames}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
