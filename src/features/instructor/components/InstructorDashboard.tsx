'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { LayoutDashboard, CalendarDays, BookOpen, GraduationCap, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatTile } from '@/components/shared/StatTile';
import { useMyInstructorProfile } from '../hooks/useMyProfile';
import { useMyInstructorStats, useMyInstructorAttendanceStats } from '../hooks/useMyDashboard';
import { useMyUpcomingSessions, useMySessionDetails } from '../hooks/useMySchedule';

export function InstructorDashboard() {
  const { data: profile } = useMyInstructorProfile();
  const { data: stats } = useMyInstructorStats();
  const { data: attendanceStats } = useMyInstructorAttendanceStats();
  const { data: upcoming = [], isLoading: upcomingLoading } = useMyUpcomingSessions(5);
  const details = useMySessionDetails(upcoming);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title={`Bonjour ${profile?.name ?? ''}`}
        description="Votre tableau de bord professeur"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <StatTile label="Séances à venir" value={stats?.upcomingSessions ?? '—'} icon={BookOpen} emphasis />
        </div>
        <StatTile label="Séances au total" value={stats?.totalSessions ?? '—'} icon={CalendarDays} />
        <StatTile
          label="Présences enregistrées"
          value={attendanceStats?.presentCount ?? '—'}
          icon={ClipboardCheck}
          tint="emerald"
        />
        <StatTile
          label="Absences enregistrées"
          value={attendanceStats?.absentCount ?? '—'}
          icon={GraduationCap}
          tint="red"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines séances</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Aucune séance à venir</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map((s) => {
                const detail = details[s.teachingAssignmentId];
                return (
                  <div key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{detail?.subjectName ?? 'Séance'}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(s.startsAt), 'dd/MM/yyyy HH:mm')} {s.room ? `· ${s.room}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4">
            <Link href="/professor/schedule" className="text-sm text-blue-600 hover:underline">
              Voir tout l&apos;emploi du temps →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
