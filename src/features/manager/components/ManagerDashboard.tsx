'use client';

import Link from 'next/link';
import { LayoutDashboard, ClipboardCheck, Building2, BookOpen, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { useManagerDashboard } from '../hooks/useManagerDashboard';
import { DashboardStatCards } from './DashboardStatCards';
import { TodaySessionsCard } from './TodaySessionsCard';
import { QueryErrorState } from './QueryErrorState';

const PRIMARY_LINKS = [
  {
    href: '/manager/validations',
    label: 'Justificatifs à valider',
    description: 'Traiter les absences en attente de décision',
    icon: ClipboardCheck,
  },
  {
    href: '/manager/teaching-assignments',
    label: 'Affectations',
    description: "Assigner les enseignants aux modules",
    icon: BookOpen,
  },
];

const SECONDARY_LINKS = [
  { href: '/manager/department', label: 'Département', icon: Building2 },
  { href: '/manager/messages', label: 'Messages', icon: MessageSquare },
];

export function ManagerDashboard() {
  const { data, isLoading, isError, refetch } = useManagerDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Tableau de bord"
        description="Vue d'ensemble de votre département"
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
            pendingValidations={data.validationStats.pendingAttendances}
            classGroupsCount={data.classGroupsCount}
            todaySessionsCount={data.todaySessions.length}
            unreadMessages={data.unreadMessages}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodaySessionsCard sessions={data.todaySessions} />
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
