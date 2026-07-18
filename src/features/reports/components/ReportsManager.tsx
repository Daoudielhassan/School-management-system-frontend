'use client';

/**
 * Container for the reports & analytics screen. Top stats are real (users +
 * audit-logs features). Below, a lookup tool queries the real read-only
 * education-core report endpoints (attendance/grades by student, class or
 * subject) — the backend has no "generated report file" concept.
 */
import { useState } from 'react';
import { PieChart } from 'lucide-react';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { useUserStats } from '@/features/users';
import { useAuditLogStats } from '@/features/audit-logs';
import { useStudents } from '@/features/students';
import { useClasses } from '@/features/classes';
import { ReportStatsCards } from './ReportStatsCards';
import { ReportLookupForm } from './ReportLookupForm';
import { AttendanceReportView } from './AttendanceReportView';
import { GradeReportView } from './GradeReportView';
import { useSubjectsList, useAttendanceReport, useGradeReport } from '../hooks/useReports';
import type { ReportKind, AttendanceScope, GradeScope } from '../types';

export function ReportsManager() {
  const [kind, setKind] = useState<ReportKind>('attendance');
  const [scope, setScope] = useState<AttendanceScope | GradeScope>('student');
  const [entityId, setEntityId] = useState('');

  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: auditStats, isLoading: auditStatsLoading } = useAuditLogStats();

  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjectsList();

  const attendanceReport = useAttendanceReport(scope as AttendanceScope, kind === 'attendance' ? entityId : undefined);
  const gradeReport = useGradeReport(scope as GradeScope, kind === 'grades' ? entityId : undefined);

  return (
    <div className="space-y-6">
        <AdminPageHeader
          icon={PieChart}
          title="Rapports &amp; analytiques"
          description="Vue d'ensemble du système et rapports de présence / notes à la demande"
        />

        <ReportStatsCards
          isLoading={userStatsLoading || auditStatsLoading}
          totalUsers={userStats?.totalUsers}
          activeUsers={userStats?.enabled}
          auditEvents={auditStats?.total}
          systemErrors={auditStats?.errors}
        />

        <ReportLookupForm
          kind={kind}
          scope={scope}
          entityId={entityId}
          students={students}
          classes={classes}
          subjects={subjects}
          onKindChange={setKind}
          onScopeChange={setScope}
          onEntityChange={setEntityId}
        />

        {!entityId ? (
          <p className="text-slate-400 text-center py-12">
            Sélectionnez un {scope === 'student' ? 'étudiant' : scope === 'class-group' ? 'classe' : 'sujet'} ci-dessus
            pour afficher son rapport.
          </p>
        ) : kind === 'attendance' ? (
          attendanceReport.isLoading ? (
            <div className="animate-pulse bg-slate-100 rounded-xl h-48" />
          ) : attendanceReport.data ? (
            <AttendanceReportView report={attendanceReport.data} />
          ) : null
        ) : gradeReport.isLoading ? (
          <div className="animate-pulse bg-slate-100 rounded-xl h-48" />
        ) : gradeReport.data ? (
          <GradeReportView report={gradeReport.data} />
        ) : null}
    </div>
  );
}
