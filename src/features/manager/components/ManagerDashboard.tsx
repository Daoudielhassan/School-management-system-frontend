'use client';

import Link from 'next/link';
import { ClipboardCheck, Building2, BookOpen, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerDashboard } from '../hooks/useManagerDashboard';
import { DashboardStatCards } from './DashboardStatCards';
import { TodaySessionsCard } from './TodaySessionsCard';
import { QueryErrorState } from './QueryErrorState';

const QUICK_LINKS = [
  { href: '/manager/validations', label: 'Validations', icon: ClipboardCheck },
  { href: '/manager/department', label: 'Département', icon: Building2 },
  { href: '/manager/teaching-assignments', label: 'Affectations', icon: BookOpen },
  { href: '/manager/messages', label: 'Messages', icon: MessageSquare },
];

export function ManagerDashboard() {
  const { data, isLoading, isError, refetch } = useManagerDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de votre département</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-2 gap-4 content-start">
              {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Card className="hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full">
                    <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
                      <div className="p-3 rounded-2xl bg-blue-50">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
