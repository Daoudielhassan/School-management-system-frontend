'use client';

import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyTeachingAssignments, useSubjects, useClassGroups, useAcademicYears } from '../hooks/useMyTeachingAssignments';
import { QueryErrorState } from './QueryErrorState';

/** Read-only — a professor doesn't create their own teaching assignments (Manager-side responsibility). */
export function MyTeachingAssignments() {
  const { data: assignments = [], isLoading, isError, refetch } = useMyTeachingAssignments();
  const { data: subjects = [] } = useSubjects();
  const { data: classGroups = [] } = useClassGroups();
  const { data: academicYears = [] } = useAcademicYears();
  const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
  const classGroupNameById = new Map(classGroups.map((c) => [c.id, c.name]));
  const academicYearCodeById = new Map(academicYears.map((y) => [y.id, y.code]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mes affectations</h1>
          <p className="text-sm text-slate-500">Les classes et matières que vous enseignez</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affectations d&apos;enseignement</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <QueryErrorState message="Impossible de charger vos affectations." onRetry={refetch} />
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune affectation pour le moment</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matière</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Année académique</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-slate-700">
                      {subjectNameById.get(a.subjectId) ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">{classGroupNameById.get(a.classGroupId) ?? '—'}</TableCell>
                    <TableCell className="text-slate-600">{academicYearCodeById.get(a.academicYearId) ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={a.status === 'ACTIVE' ? 'default' : 'outline'}>{a.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
