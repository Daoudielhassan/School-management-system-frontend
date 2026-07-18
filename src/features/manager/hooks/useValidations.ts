/**
 * Attendance-justification validation hooks — the manager's core workflow:
 * review pending justifications and approve/reject them, one at a time or in
 * bulk.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyManagerId } from './useMyProfile';
import {
  fetchPendingValidations,
  validateAttendance,
  bulkValidateAttendance,
  fetchValidationStats,
} from '../api/validations.api';
import {
  MANAGER_PENDING_VALIDATIONS_QUERY_KEY,
  MANAGER_VALIDATION_STATS_QUERY_KEY,
  MANAGER_DEPARTMENT_ATTENDANCE_QUERY_KEY,
} from '../constants';
import type {
  PendingAttendanceDTO,
  ValidationDecision,
  ValidationResultDTO,
  BulkValidationResultDTO,
  ValidationStatsDTO,
} from '../types';

/** `GET /api/manager/validations/attendances/pending`. */
export function usePendingValidations(params: { classGroupId?: string; subjectId?: string } = {}) {
  const { token } = useAuth();

  return useQuery<PendingAttendanceDTO[]>({
    queryKey: [...MANAGER_PENDING_VALIDATIONS_QUERY_KEY, params.classGroupId ?? null, params.subjectId ?? null],
    queryFn: () => fetchPendingValidations(params, token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

/** `GET /api/manager/validations/stats?managerId=`. */
export function useValidationStats() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<ValidationStatsDTO>({
    queryKey: [...MANAGER_VALIDATION_STATS_QUERY_KEY, managerId],
    queryFn: () => fetchValidationStats(managerId as string, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 30_000,
  });
}

function useInvalidateValidations() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: MANAGER_PENDING_VALIDATIONS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: MANAGER_VALIDATION_STATS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: MANAGER_DEPARTMENT_ATTENDANCE_QUERY_KEY });
  };
}

/** `POST /api/manager/validations/attendances/{attendanceId}/validate` — `validatedBy` is the manager's own id. */
export function useValidateAttendance() {
  const { token } = useAuth();
  const managerId = useMyManagerId();
  const invalidate = useInvalidateValidations();

  return useMutation<
    ValidationResultDTO,
    Error,
    { attendanceId: string; decision: ValidationDecision; managerComment?: string }
  >({
    mutationFn: ({ attendanceId, decision, managerComment }) => {
      if (!managerId) throw new Error('Manager profile not loaded.');
      return validateAttendance(attendanceId, { validatedBy: managerId, decision, managerComment }, token ?? undefined);
    },
    onSuccess: invalidate,
  });
}

/** `POST /api/manager/validations/attendances/bulk-validate`. */
export function useBulkValidateAttendance() {
  const { token } = useAuth();
  const managerId = useMyManagerId();
  const invalidate = useInvalidateValidations();

  return useMutation<
    BulkValidationResultDTO,
    Error,
    { attendanceIds: string[]; decision: ValidationDecision; managerComment?: string }
  >({
    mutationFn: ({ attendanceIds, decision, managerComment }) => {
      if (!managerId) throw new Error('Manager profile not loaded.');
      return bulkValidateAttendance(
        { attendanceIds, validatedBy: managerId, decision, managerComment },
        token ?? undefined
      );
    },
    onSuccess: invalidate,
  });
}
