'use client';

/**
 * Manager-scoped reports screen — attendance by class group and
 * attendance/grades by student, both restricted to the manager's own
 * department (enforced server-side). Entity pickers are always name-based
 * selects fed by department-scoped data — never a raw id input.
 */
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileCheck,
  CalendarCheck,
  CalendarX,
  Clock,
  Hash,
  TrendingUp,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { useDepartmentClassGroups, useDepartmentDiplomas } from '../hooks/useDepartment';
import { useDepartmentStudents } from '../hooks/useDepartmentStudents';
import { useAttendanceReport, useGradeReport } from '@/features/reports';
import type { AttendanceReport, GradeReport } from '@/features/reports';
import { QueryErrorState } from './QueryErrorState';

function StatCard({ icon: Icon, value, label }: { icon: typeof FileCheck; value: string | number; label: string }) {
  return (
    <Card className="hover:border-blue-300 transition-all duration-300 group">
      <CardContent className="p-4 text-center">
        <Icon className="h-5 w-5 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </CardContent>
    </Card>
  );
}

function AttendanceStats({ report }: { report: AttendanceReport }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FileCheck} value={report.totalRecords} label="Total" />
        <StatCard icon={CalendarCheck} value={report.present} label="Présent" />
        <StatCard icon={CalendarX} value={report.absent} label="Absent" />
        <StatCard icon={Clock} value={report.late} label="Retard" />
      </div>
      <p className="text-center text-sm text-slate-500">
        Taux de présence : <span className="font-semibold text-slate-800">{report.attendanceRatePercent}%</span>
      </p>
    </div>
  );
}

function GradeStats({ report }: { report: GradeReport }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Hash} value={report.count} label="Notes" />
        <StatCard icon={TrendingUp} value={`${report.averagePercent}%`} label="Moyenne" />
        <StatCard icon={ArrowDown} value={`${report.minPercent}%`} label="Minimum" />
        <StatCard icon={ArrowUp} value={`${report.maxPercent}%`} label="Maximum" />
      </div>
      {report.bySubject && report.bySubject.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Par matière</h4>
            <div className="space-y-1.5">
              {report.bySubject.map((s) => (
                <div key={s.subjectId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{s.subjectId}</span>
                  <span className="text-slate-800 font-medium">
                    {s.averagePercent}% ({s.count} notes)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function DepartmentReports() {
  const { data: classGroups = [] } = useDepartmentClassGroups();
  const { students, isLoading: studentsLoading } = useDepartmentStudents();
  const [classGroupId, setClassGroupId] = useState('');
  const [studentId, setStudentId] = useState('');

  const classAttendance = useAttendanceReport('class-group', classGroupId || undefined);
  const studentAttendance = useAttendanceReport('student', studentId || undefined);
  const studentGrades = useGradeReport('student', studentId || undefined);

  const diplomasQuery = useDepartmentDiplomas();
  const studentName = useMemo(() => {
    const byId = new Map(students.map((s) => [s.id, `${s.firstName} ${s.lastName}`]));
    return (id: string) => byId.get(id) ?? id.slice(0, 8);
  }, [students]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Rapports</h1>
        <p className="text-slate-500 mt-1">
          Statistiques de présence et de notes, limitées à votre département
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="class">
            <TabsList>
              <TabsTrigger value="class">Par classe</TabsTrigger>
              <TabsTrigger value="student">Par étudiant</TabsTrigger>
              <TabsTrigger value="diplomas">Diplômes</TabsTrigger>
            </TabsList>

            <TabsContent value="class" className="space-y-4 pt-4">
              <div className="max-w-sm space-y-1.5">
                <Label>Classe</Label>
                <Select value={classGroupId} onValueChange={setClassGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classGroups.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!classGroupId ? (
                <p className="text-center py-12 text-slate-400">
                  Sélectionnez une classe pour voir son rapport de présence.
                </p>
              ) : classAttendance.isError ? (
                <QueryErrorState
                  message="Impossible de charger le rapport de présence."
                  onRetry={classAttendance.refetch}
                />
              ) : classAttendance.data ? (
                <AttendanceStats report={classAttendance.data} />
              ) : null}
            </TabsContent>

            <TabsContent value="student" className="space-y-4 pt-4">
              <div className="max-w-sm space-y-1.5">
                <Label>Étudiant</Label>
                <Select value={studentId} onValueChange={setStudentId} disabled={studentsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!studentId ? (
                <p className="text-center py-12 text-slate-400">
                  Sélectionnez un étudiant de votre département pour voir son rapport.
                </p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Présence</h3>
                    {studentAttendance.isError ? (
                      <QueryErrorState
                        message="Impossible de charger le rapport de présence."
                        onRetry={studentAttendance.refetch}
                      />
                    ) : studentAttendance.data ? (
                      <AttendanceStats report={studentAttendance.data} />
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Notes</h3>
                    {studentGrades.isError ? (
                      <QueryErrorState
                        message="Impossible de charger le rapport de notes."
                        onRetry={studentGrades.refetch}
                      />
                    ) : studentGrades.data ? (
                      <GradeStats report={studentGrades.data} />
                    ) : null}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="diplomas" className="space-y-4 pt-4">
              {diplomasQuery.isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : diplomasQuery.isError ? (
                <QueryErrorState
                  message="Impossible de charger les diplômes."
                  onRetry={diplomasQuery.refetch}
                />
              ) : (diplomasQuery.data ?? []).length === 0 ? (
                <p className="text-center py-12 text-slate-400">
                  Aucun diplôme émis pour l&apos;instant — ils sont générés automatiquement lors de la
                  bascule annuelle par l&apos;administration.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Année académique</TableHead>
                      <TableHead>Délivré le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(diplomasQuery.data ?? []).map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium text-slate-700">{studentName(d.studentId)}</TableCell>
                        <TableCell className="text-slate-600">{d.academicYearId.slice(0, 8)}…</TableCell>
                        <TableCell className="text-slate-600">
                          {format(new Date(d.issuedAt), 'dd/MM/yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
