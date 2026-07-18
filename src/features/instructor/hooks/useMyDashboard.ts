/**
 * Dashboard stats — `GET /api/instructors/{id}/stats` and `/attendance-stats`.
 */
import { useQuery } from '@tanstack/react-query';
import { apiGet, API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { useMyInstructorId } from './useMyProfile';

export interface InstructorStats {
  instructorId: string;
  totalSessions: number;
  upcomingSessions: number;
}

export interface InstructorAttendanceStats {
  instructorId: string;
  sessionsCount: number;
  recordsCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
}

export function useMyInstructorStats() {
  const { token } = useAuth();
  const instructorId = useMyInstructorId();

  return useQuery<InstructorStats>({
    queryKey: ['instructor', 'stats', instructorId],
    queryFn: () => apiGet<InstructorStats>(API_ENDPOINTS.INSTRUCTORS.STATS(instructorId as string), token ?? undefined),
    enabled: !!instructorId && !!token,
    staleTime: 60_000,
  });
}

export function useMyInstructorAttendanceStats() {
  const { token } = useAuth();
  const instructorId = useMyInstructorId();

  return useQuery<InstructorAttendanceStats>({
    queryKey: ['instructor', 'attendance-stats', instructorId],
    queryFn: () =>
      apiGet<InstructorAttendanceStats>(API_ENDPOINTS.INSTRUCTORS.ATTENDANCE_STATS(instructorId as string), token ?? undefined),
    enabled: !!instructorId && !!token,
    staleTime: 60_000,
  });
}
