/**
 * Write-side hooks for the attendance feature.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { updateAttendanceStatus } from '../api/attendance.api';
import { ATTENDANCE_QUERY_KEY } from '../constants';

export interface UpdateAttendanceInput {
  id: string;
  status: string;
}

export function useUpdateAttendanceStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateAttendanceInput>({
    mutationFn: ({ id, status }) => updateAttendanceStatus(id, status, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY }),
  });
}
