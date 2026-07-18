'use client';

import { useMemo } from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { useSubjectsList } from '@/features/reports';
import { useMyGrades, useMyGradeSummary } from '../hooks/useMyGrades';
import { GradesSummaryCards } from './GradesSummaryCards';
import { GradesTable } from './GradesTable';

export function MyGrades() {
  const { data: grades = [], isLoading, isError, refetch } = useMyGrades();
  const { data: summary } = useMyGradeSummary();
  const { data: subjects = [] } = useSubjectsList();

  const subjectName = useMemo(() => {
    const byId = new Map(subjects.map((s) => [s.id, s.name]));
    return (id: string) => byId.get(id) ?? 'Matière inconnue';
  }, [subjects]);

  return (
    <div className="space-y-6">
      <PageHeader icon={Award} title="Mes notes" description="Suivi de vos résultats académiques" />

      {summary && <GradesSummaryCards summary={summary} />}

      <Card>
        <CardContent className="p-6">
          <GradesTable
            grades={grades}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            subjectName={subjectName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
