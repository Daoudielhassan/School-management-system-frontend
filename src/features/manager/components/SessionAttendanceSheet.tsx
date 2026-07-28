'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { AttendanceStatusPicker, type AttendanceStatusValue } from '@/components/shared/AttendanceStatusPicker';
import { extractErrorMessage } from '@/lib/api-error';
import { QueryErrorState } from './QueryErrorState';
import { useDepartmentSessions } from '../hooks/useDepartment';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { useClassGroupStudents } from '../hooks/useClassStudents';
import {
  useSessionAttendance,
  useInitializeSessionAttendance,
  useBulkUpdateAttendance,
} from '../hooks/useSessionAttendance';
import type { AttendanceStatus, SessionData } from '../types';

/** Both 1h30 sessions of a half-day, earliest first. */
interface HalfDayPair {
  groupId: string;
  sessions: [SessionData, SessionData];
}

function pairSessionsByGroup(sessions: SessionData[]): HalfDayPair[] {
  const byGroup = new Map<string, SessionData[]>();
  sessions.forEach((s) => {
    if (!s.groupId) return;
    const list = byGroup.get(s.groupId) ?? [];
    list.push(s);
    byGroup.set(s.groupId, list);
  });
  return Array.from(byGroup.entries())
    .filter(([, list]) => list.length === 2)
    .map(([groupId, list]) => {
      const sorted = [...list].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
      return { groupId, sessions: sorted as [SessionData, SessionData] };
    });
}

export function SessionAttendanceSheet() {
  const { data: sessions = [] } = useDepartmentSessions();
  const sessionDetails = useSessionDetails(sessions);
  const [groupId, setGroupId] = useState('');

  const pairs = useMemo(() => pairSessionsByGroup(sessions), [sessions]);
  const selectedPair = pairs.find((p) => p.groupId === groupId);
  const [session1, session2] = selectedPair?.sessions ?? [undefined, undefined];

  const attendance1 = useSessionAttendance(session1?.id);
  const attendance2 = useSessionAttendance(session2?.id);
  const initialize = useInitializeSessionAttendance();
  const bulkUpdate = useBulkUpdateAttendance();

  const [pending, setPending] = useState<Record<string, AttendanceStatus>>({});

  const records1 = useMemo(() => attendance1.data ?? [], [attendance1.data]);
  const records2 = useMemo(() => attendance2.data ?? [], [attendance2.data]);
  const classGroupId = records1[0]?.classGroupId ?? records2[0]?.classGroupId;
  const { students, isLoading: studentsLoading } = useClassGroupStudents(classGroupId);

  useEffect(() => {
    setPending(Object.fromEntries([...records1, ...records2].map((r) => [r.id, r.status])));
  }, [records1, records2]);

  const sortedPairs = [...pairs].sort(
    (a, b) => new Date(b.sessions[0].startsAt).getTime() - new Date(a.sessions[0].startsAt).getTime()
  );

  const isLoading = (session1 && attendance1.isLoading) || (session2 && attendance2.isLoading) || studentsLoading;
  const isError = attendance1.isError || attendance2.isError;
  const session1Initialized = records1.length > 0;
  const session2Initialized = records2.length > 0;
  const neitherInitialized = !!groupId && !session1Initialized && !session2Initialized;

  const hasChanges = [...records1, ...records2].some((r) => pending[r.id] && pending[r.id] !== r.status);

  // Every student enrolled, each with their two per-session records (a
  // student missing from one side just shows as unset for that column —
  // shouldn't normally happen since both sessions share the same class).
  const rows = useMemo(() => {
    const bySessionRecord = (records: typeof records1) => new Map(records.map((r) => [r.studentId, r]));
    const map1 = bySessionRecord(records1);
    const map2 = bySessionRecord(records2);
    return students.map((student) => ({
      student,
      record1: map1.get(student.id),
      record2: map2.get(student.id),
    }));
  }, [students, records1, records2]);

  const handleSave = async () => {
    const updatesFor = (records: typeof records1) =>
      records
        .filter((r) => pending[r.id] && pending[r.id] !== r.status)
        .map((r) => ({ attendanceId: r.id, status: pending[r.id] }));
    try {
      await Promise.all([
        session1 && updatesFor(records1).length > 0
          ? bulkUpdate.mutateAsync({ sessionId: session1.id, updates: updatesFor(records1) })
          : Promise.resolve(),
        session2 && updatesFor(records2).length > 0
          ? bulkUpdate.mutateAsync({ sessionId: session2.id, updates: updatesFor(records2) })
          : Promise.resolve(),
      ]);
      toast.success('Présences mises à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour des présences'));
    }
  };

  const handleInitialize = async () => {
    if (!session1 || !session2) return;
    try {
      await Promise.all([initialize.mutateAsync(session1.id), initialize.mutateAsync(session2.id)]);
      toast.success('Feuilles de présence initialisées');
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'initialisation"));
    }
  };

  const handleInitializeOne = async (sessionId: string, label: string) => {
    try {
      await initialize.mutateAsync(sessionId);
      toast.success(`${label} initialisée`);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'initialisation"));
    }
  };

  const markAll = (status: AttendanceStatus) => {
    setPending((prev) => {
      const next = { ...prev };
      [...records1, ...records2].forEach((r) => {
        next[r.id] = status;
      });
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="max-w-sm space-y-1.5">
        <Label>Demi-journée</Label>
        <Select value={groupId} onValueChange={setGroupId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une demi-journée" />
          </SelectTrigger>
          <SelectContent>
            {sortedPairs.map((p) => {
              const detail = p.sessions[0].teachingAssignmentId
                ? sessionDetails[p.sessions[0].teachingAssignmentId]
                : undefined;
              return (
                <SelectItem key={p.groupId} value={p.groupId}>
                  {format(new Date(p.sessions[0].startsAt), 'dd/MM/yyyy')} — {detail?.subjectName ?? 'Séance'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {!groupId ? (
        <p className="text-center py-12 text-slate-400">
          Sélectionnez une demi-journée pour gérer sa feuille de présence.
        </p>
      ) : isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <QueryErrorState
          message="Impossible de charger la feuille de présence."
          onRetry={() => {
            attendance1.refetch();
            attendance2.refetch();
          }}
        />
      ) : neitherInitialized ? (
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-slate-500">Aucune feuille de présence pour cette demi-journée.</p>
            <Button onClick={handleInitialize} disabled={initialize.isPending}>
              {initialize.isPending ? 'Initialisation…' : 'Initialiser les 2 feuilles de présence'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(!session1Initialized || !session2Initialized) && (
            <Alert>
              <AlertDescription className="flex items-center justify-between gap-3 flex-wrap">
                <span>
                  {!session1Initialized ? 'La Séance 1' : 'La Séance 2'} n&apos;a pas encore de feuille de présence.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={initialize.isPending}
                  onClick={() =>
                    !session1Initialized && session1
                      ? handleInitializeOne(session1.id, 'Séance 1')
                      : session2 && handleInitializeOne(session2.id, 'Séance 2')
                  }
                >
                  {initialize.isPending ? 'Initialisation…' : 'Initialiser cette séance'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

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
                <TableHead className="text-right">
                  Séance 1 ({session1 && format(new Date(session1.startsAt), 'HH:mm')}–
                  {session1 && format(new Date(session1.endsAt), 'HH:mm')})
                </TableHead>
                <TableHead className="text-right">
                  Séance 2 ({session2 && format(new Date(session2.startsAt), 'HH:mm')}–
                  {session2 && format(new Date(session2.endsAt), 'HH:mm')})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ student, record1, record2 }) => (
                <TableRow key={student.id}>
                  <TableCell className="text-slate-700">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      {record1 ? (
                        <AttendanceStatusPicker
                          value={(pending[record1.id] ?? record1.status) as AttendanceStatusValue}
                          onChange={(status) =>
                            setPending((prev) => ({ ...prev, [record1.id]: status as AttendanceStatus }))
                          }
                        />
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      {record2 ? (
                        <AttendanceStatusPicker
                          value={(pending[record2.id] ?? record2.status) as AttendanceStatusValue}
                          onChange={(status) =>
                            setPending((prev) => ({ ...prev, [record2.id]: status as AttendanceStatus }))
                          }
                        />
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
