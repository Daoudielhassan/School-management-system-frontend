import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchSessionAttendance,
  initializeSessionAttendance,
  bulkUpdateAttendance,
} from '../api/sessionAttendance.api';
import { INSTRUCTOR_SESSION_ATTENDANCE_QUERY_KEY } from '../constants';
import type { AttendanceResponse, AttendanceStatus } from '../types';

/** `GET /api/attendance/session/{sessionId}`. */
export function useSessionAttendance(sessionId?: string) {
  const { token } = useAuth();

  return useQuery<AttendanceResponse[]>({
    queryKey: [...INSTRUCTOR_SESSION_ATTENDANCE_QUERY_KEY, sessionId],
    queryFn: () => fetchSessionAttendance(sessionId as string, token ?? undefined),
    enabled: !!sessionId && !!token,
    staleTime: 30_000,
  });
}

/** `POST /api/attendance/initialize/{sessionId}`. */
export function useInitializeSessionAttendance() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (sessionId) => initializeSessionAttendance(sessionId, token ?? undefined),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: [...INSTRUCTOR_SESSION_ATTENDANCE_QUERY_KEY, sessionId] });
    },
  });
}

/** `PATCH /api/attendance/bulk-update`. */
export function useBulkUpdateAttendance() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    AttendanceResponse[],
    Error,
    { sessionId: string; updates: { attendanceId: string; status: AttendanceStatus }[] }
  >({
    mutationFn: ({ updates }) => bulkUpdateAttendance(updates, token ?? undefined),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...INSTRUCTOR_SESSION_ATTENDANCE_QUERY_KEY, variables.sessionId] });
    },
  });
}
