/**
 * Repetition (Jury phase) API layer — `/api/managers/{managerId}/department/repetitions`.
 * departmentId is never sent from the client: resolved and enforced server-side
 * (see ManagerAccessGuard / ProcessStudentRepetitionUseCase).
 */
import { apiPost, API_ENDPOINTS } from '@/config/api';
import type { RepetitionPayload } from '../types';

/** `POST /api/managers/{managerId}/department/repetitions`. */
export function processRepetition(
  managerId: string,
  payload: RepetitionPayload,
  token?: string
): Promise<void> {
  return apiPost<void>(API_ENDPOINTS.MANAGERS.REPETITIONS(managerId), payload, token);
}
