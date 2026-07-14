'use client';

import { useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMySchedule } from '../hooks/useMySchedule';
import { getWeekStartIso } from '../lib/week';
import { WeekScheduleGrid } from './WeekScheduleGrid';

export function MySchedule() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartIso());
  const { schedule, instructorNames, isLoading, isError } = useMySchedule(weekStart);

  const weekEnd = addDays(parseISO(weekStart), 6);
  const label = `${format(parseISO(weekStart), 'dd MMM', { locale: fr })} – ${format(weekEnd, 'dd MMM yyyy', { locale: fr })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Emploi du temps</h1>
          <p className="text-slate-500 mt-1 capitalize">{label}</p>
        </div>
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
      </div>

      {isError ? (
        <p className="text-center text-red-600 py-12">Impossible de charger l&apos;emploi du temps.</p>
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
