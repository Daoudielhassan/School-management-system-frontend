/**
 * Dashboard aggregation: pending-validation count, department size, today's
 * sessions and unread counts, fetched in parallel via `Promise.all`.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyManagerId } from './useMyProfile';
import { fetchValidationStats } from '../api/validations.api';
import { fetchDepartmentClassGroups, fetchDepartmentSessions } from '../api/department.api';
import { fetchMyUnreadNotificationCount } from '../api/notifications.api';
import { fetchMyUnreadMessageCount } from '../api/messages.api';
import { MANAGER_DASHBOARD_QUERY_KEY } from '../constants';
import type { ClassGroupLite, SessionData, ValidationStatsDTO } from '../types';

export interface ManagerDashboardData {
  validationStats: ValidationStatsDTO;
  classGroupsCount: number;
  todaySessions: SessionData[];
  unreadMessages: number;
  unreadNotifications: number;
}

function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function useManagerDashboard() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<ManagerDashboardData>({
    queryKey: [...MANAGER_DASHBOARD_QUERY_KEY, managerId],
    queryFn: async () => {
      const t = token ?? undefined;
      const id = managerId as string;
      const [validationStats, classGroups, sessions, unreadMessages, unreadNotifications] = await Promise.all([
        fetchValidationStats(id, t),
        fetchDepartmentClassGroups(id, t),
        fetchDepartmentSessions(id, t),
        fetchMyUnreadMessageCount(t),
        fetchMyUnreadNotificationCount(t),
      ]);

      return {
        validationStats,
        classGroupsCount: (classGroups as ClassGroupLite[]).length,
        todaySessions: (sessions as SessionData[]).filter((s) => isToday(s.startsAt)),
        unreadMessages,
        unreadNotifications,
      };
    },
    enabled: !!managerId && !!token,
    staleTime: 60_000,
  });
}
