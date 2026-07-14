import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchMyAttendance, fetchMyAttendanceSummary, justifyAttendance } from '../api/attendance.api';
import { STUDENT_ATTENDANCE_QUERY_KEY } from '../constants';
import type { AttendanceResponse, AttendanceSummary, JustifyAttendancePayload } from '../types';

/** `GET /api/attendance/me` — full history, status included per record. */
export function useMyAttendance() {
  const { token } = useAuth();

  return useQuery<AttendanceResponse[]>({
    queryKey: STUDENT_ATTENDANCE_QUERY_KEY,
    queryFn: () => fetchMyAttendance(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** `GET /api/reports/attendance/me` — the attendance rate. */
export function useMyAttendanceSummary() {
  const { token } = useAuth();

  return useQuery<AttendanceSummary>({
    queryKey: [...STUDENT_ATTENDANCE_QUERY_KEY, 'summary'],
    queryFn: () => fetchMyAttendanceSummary(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** `POST /api/attendance/{id}/justify`. Invalidates the history so the new status shows up. */
export function useJustifyAttendance() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AttendanceResponse, Error, { id: string; payload: JustifyAttendancePayload }>({
    mutationFn: ({ id, payload }) => justifyAttendance(id, payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_ATTENDANCE_QUERY_KEY });
    },
  });
}
