'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { CalendarDays, BookOpen, GraduationCap, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Bonjour {profile?.name ?? ''}</h1>
        <p className="text-slate-500 mt-1">Votre tableau de bord professeur</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalSessions ?? '—'}</p>
              <p className="text-xs text-slate-500">Séances au total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.upcomingSessions ?? '—'}</p>
              <p className="text-xs text-slate-500">Séances à venir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{attendanceStats?.presentCount ?? '—'}</p>
              <p className="text-xs text-slate-500">Présences enregistrées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50">
              <GraduationCap className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{attendanceStats?.absentCount ?? '—'}</p>
              <p className="text-xs text-slate-500">Absences enregistrées</p>
            </div>
          </CardContent>
        </Card>
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
