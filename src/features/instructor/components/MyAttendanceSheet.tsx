'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { AttendanceStatusPicker, type AttendanceStatusValue } from '@/components/shared/AttendanceStatusPicker';
import { extractErrorMessage } from '@/lib/api-error';
import { QueryErrorState } from './QueryErrorState';
import { useMySessions, useMySessionDetails } from '../hooks/useMySchedule';
import { useClassGroupStudents } from '../hooks/useClassGroupStudents';
import {
  useSessionAttendance,
  useInitializeSessionAttendance,
  useBulkUpdateAttendance,
} from '../hooks/useSessionAttendance';
import type { AttendanceStatus } from '../types';

export function MyAttendanceSheet() {
  const { data: sessions = [] } = useMySessions();
  const sessionDetails = useMySessionDetails(sessions);
  const [sessionId, setSessionId] = useState('');

  const attendanceQuery = useSessionAttendance(sessionId || undefined);
  const initialize = useInitializeSessionAttendance();
  const bulkUpdate = useBulkUpdateAttendance();

  const [pending, setPending] = useState<Record<string, AttendanceStatus>>({});

  const records = useMemo(() => attendanceQuery.data ?? [], [attendanceQuery.data]);
  const classGroupId = records[0]?.classGroupId;
  const { students, isLoading: studentsLoading } = useClassGroupStudents(classGroupId);
  const studentById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  useEffect(() => {
    setPending(Object.fromEntries(records.map((r) => [r.id, r.status])));
  }, [records]);

  const sorted = [...sessions].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const hasChanges = records.some((r) => pending[r.id] && pending[r.id] !== r.status);

  const handleSave = async () => {
    const updates = records
      .filter((r) => pending[r.id] && pending[r.id] !== r.status)
      .map((r) => ({ attendanceId: r.id, status: pending[r.id] }));
    if (updates.length === 0) return;
    try {
      await bulkUpdate.mutateAsync({ sessionId, updates });
      toast.success('Présences mises à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour des présences'));
    }
  };

  const handleInitialize = async () => {
    try {
      await initialize.mutateAsync(sessionId);
      toast.success('Feuille de présence initialisée');
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'initialisation"));
    }
  };

  const markAll = (status: AttendanceStatus) => {
    setPending((prev) => {
      const next = { ...prev };
      records.forEach((r) => {
        next[r.id] = status;
      });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Feuille de présence"
        description="Enregistrez les présences de vos séances"
      />

      <div className="max-w-sm space-y-1.5">
        <Label>Séance</Label>
        <Select value={sessionId} onValueChange={setSessionId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une séance" />
          </SelectTrigger>
          <SelectContent>
            {sorted.map((s) => {
              const detail = sessionDetails[s.teachingAssignmentId];
              return (
                <SelectItem key={s.id} value={s.id}>
                  {format(new Date(s.startsAt), 'dd/MM/yyyy HH:mm')} — {detail?.subjectName ?? 'Séance'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {!sessionId ? (
        <p className="text-center py-12 text-slate-400">
          Sélectionnez une séance pour gérer sa feuille de présence.
        </p>
      ) : attendanceQuery.isLoading || studentsLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : attendanceQuery.isError ? (
        <QueryErrorState
          message="Impossible de charger la feuille de présence."
          onRetry={attendanceQuery.refetch}
        />
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-slate-500">Aucune feuille de présence pour cette séance.</p>
            <Button onClick={handleInitialize} disabled={initialize.isPending}>
              {initialize.isPending ? 'Initialisation…' : 'Initialiser la feuille de présence'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')}>
                Tout marquer présent
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')}>
                Tout marquer absent
              </Button>
            </div>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || bulkUpdate.isPending}>
              {bulkUpdate.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => {
                const student = studentById.get(r.studentId);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-slate-700">
                      {student ? `${student.firstName} ${student.lastName}` : 'Étudiant…'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <AttendanceStatusPicker
                          value={(pending[r.id] ?? r.status) as AttendanceStatusValue}
                          onChange={(status) =>
                            setPending((prev) => ({ ...prev, [r.id]: status as AttendanceStatus }))
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
