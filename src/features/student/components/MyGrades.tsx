'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useMyGrades, useMyGradeSummary } from '../hooks/useMyGrades';
import { GradesSummaryCards } from './GradesSummaryCards';
import { GradesTable } from './GradesTable';

export function MyGrades() {
  const { data: grades = [], isLoading } = useMyGrades();
  const { data: summary } = useMyGradeSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Mes notes</h1>
        <p className="text-slate-500 mt-1">Suivi de vos résultats académiques</p>
      </div>

      {summary && <GradesSummaryCards summary={summary} />}

      <Card>
        <CardContent className="p-6">
          <GradesTable grades={grades} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
