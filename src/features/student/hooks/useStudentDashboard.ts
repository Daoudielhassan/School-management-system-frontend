/**
 * Dashboard aggregation: every widget that doesn't need the enrollment →
 * class-group chain is fetched in parallel via `Promise.all`; today's
 * schedule still needs that chain, so `classGroupId` is resolved up front
 * (from the already-cached enrollments) and folded into the same batch.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchMyAttendanceSummary } from '../api/attendance.api';
import { fetchMyGradeSummary } from '../api/grades.api';
import { fetchMyUnreadNotificationCount } from '../api/notifications.api';
import { fetchMyUnreadMessageCount } from '../api/messages.api';
import { fetchWeekSchedule } from '../api/schedule.api';
import { useMyActiveClassGroupId } from './useMySchedule';
import { STUDENT_DASHBOARD_QUERY_KEY } from '../constants';
import { getWeekStartIso, toIsoDate } from '../lib/week';
import type { AttendanceSummary, GradeSummary, WeekSchedule } from '../types';
import type { SessionData } from '@/features/sessions';

export interface StudentDashboardData {
  attendance: AttendanceSummary;
  grades: GradeSummary;
  unreadNotifications: number;
  unreadMessages: number;
  todaySchedule: SessionData[];
}

export function useStudentDashboard() {
  const { token } = useAuth();
  const classGroupId = useMyActiveClassGroupId();
  const today = toIsoDate(new Date());
  const weekStart = getWeekStartIso(new Date());

  return useQuery<StudentDashboardData>({
    queryKey: [...STUDENT_DASHBOARD_QUERY_KEY, classGroupId, today],
    queryFn: async () => {
      const t = token ?? undefined;
      const [attendance, grades, unreadNotifications, unreadMessages, weekSchedule] = await Promise.all([
        fetchMyAttendanceSummary(t),
        fetchMyGradeSummary(t),
        fetchMyUnreadNotificationCount(t),
        fetchMyUnreadMessageCount(t),
        classGroupId
          ? fetchWeekSchedule(classGroupId, weekStart, t)
          : Promise.resolve<WeekSchedule>({}),
      ]);

      return {
        attendance,
        grades,
        unreadNotifications,
        unreadMessages,
        todaySchedule: weekSchedule[today] ?? [],
      };
    },
    enabled: !!token,
    staleTime: 60_000,
  });
}
