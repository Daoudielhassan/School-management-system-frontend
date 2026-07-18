/**
 * Attendance-justification validation API layer — `/api/manager/validations/**`
 * (`manager.api.ValidationController`, moved off `/api/validations` in v0).
 */
import { apiGet, apiPost, API_ENDPOINTS } from '@/config/api';
import type {
  PendingAttendanceDTO,
  AttendanceValidationPayload,
  ValidationResultDTO,
  BulkAttendanceValidationPayload,
  BulkValidationResultDTO,
  ValidationStatsDTO,
} from '../types';

/** `GET /api/manager/validations/attendances/pending`. */
export function fetchPendingValidations(
  params: { classGroupId?: string; subjectId?: string },
  token?: string
): Promise<PendingAttendanceDTO[]> {
  return apiGet<PendingAttendanceDTO[]>(API_ENDPOINTS.MANAGER_VALIDATIONS.ATTENDANCE_PENDING(params), token);
}

/** `POST /api/manager/validations/attendances/{attendanceId}/validate`. */
export function validateAttendance(
  attendanceId: string,
  payload: AttendanceValidationPayload,
  token?: string
): Promise<ValidationResultDTO> {
  return apiPost<ValidationResultDTO>(
    API_ENDPOINTS.MANAGER_VALIDATIONS.ATTENDANCE_VALIDATE(attendanceId),
    payload,
    token
  );
}

/** `POST /api/manager/validations/attendances/bulk-validate`. */
export function bulkValidateAttendance(
  payload: BulkAttendanceValidationPayload,
  token?: string
): Promise<BulkValidationResultDTO> {
  return apiPost<BulkValidationResultDTO>(
    API_ENDPOINTS.MANAGER_VALIDATIONS.ATTENDANCE_BULK_VALIDATE,
    payload,
    token
  );
}

/** `GET /api/manager/validations/stats?managerId=`. */
export function fetchValidationStats(managerId: string, token?: string): Promise<ValidationStatsDTO> {
  return apiGet<ValidationStatsDTO>(API_ENDPOINTS.MANAGER_VALIDATIONS.STATS(managerId), token);
}
