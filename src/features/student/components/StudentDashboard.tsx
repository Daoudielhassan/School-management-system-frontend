'use client';

import Link from 'next/link';
import { LayoutDashboard, Award, ClipboardList, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { DashboardStatCards } from './DashboardStatCards';
import { TodaySessionsCard } from './TodaySessionsCard';
import { QueryErrorState } from './QueryErrorState';

const PRIMARY_LINKS = [
  { href: '/student/grades', label: 'Mes notes', description: 'Résultats et moyennes par matière', icon: Award },
  {
    href: '/student/attendance',
    label: 'Mes présences',
    description: 'Historique et justificatifs d’absence',
    icon: ClipboardList,
  },
];

const SECONDARY_LINKS = [
  { href: '/student/schedule', label: 'Emploi du temps', icon: Calendar },
  { href: '/student/messages', label: 'Messages', icon: MessageSquare },
];

export function StudentDashboard() {
  const { data, isLoading, isError, refetch } = useStudentDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Tableau de bord"
        description="Vue d'ensemble de votre scolarité"
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="p-6">
            <QueryErrorState message="Impossible de charger le tableau de bord." onRetry={refetch} />
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <DashboardStatCards
            attendance={data.attendance}
            grades={data.grades}
            unreadMessages={data.unreadMessages}
            unreadNotifications={data.unreadNotifications}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodaySessionsCard sessions={data.todaySchedule} />
            </div>

            <div className="flex flex-col gap-3">
              {PRIMARY_LINKS.map(({ href, label, description, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Card className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex-shrink-0 grid place-items-center h-10 w-10 rounded-xl bg-blue-50 group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500 truncate">{description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}

              <div className="flex gap-3">
                {SECONDARY_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="flex-1">
                    <Card className="border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 h-full">
                      <CardContent className="p-3.5 flex flex-col items-center justify-center text-center gap-1.5">
                        <Icon className="h-5 w-5 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600">{label}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
