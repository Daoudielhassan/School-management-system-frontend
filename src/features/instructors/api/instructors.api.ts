/**
 * Instructors API layer — thin, framework-agnostic wrappers over the shared
 * HTTP client. No React, no cache logic here: functions take a `token` and
 * return promises. Hooks (in ../hooks) add React Query and cache invalidation.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type {
  InstructorData,
  CreateInstructorResponse,
  InstructorCreatePayload,
  InstructorMutationPayload,
  BulkUploadResult,
} from '../types';

/** Fetch the full instructors list. */
export function fetchInstructors(token?: string): Promise<InstructorData[]> {
  return apiGet<InstructorData[]>(API_ENDPOINTS.INSTRUCTORS.BASE, token);
}

/** Create an instructor. `code` is generated server-side; the response carries a one-time `temporaryPassword`. */
export function createInstructor(
  payload: InstructorCreatePayload,
  token?: string
): Promise<CreateInstructorResponse> {
  return apiPost<CreateInstructorResponse>(API_ENDPOINTS.INSTRUCTORS.BASE, payload, token);
}

/** Update an existing instructor. */
export function updateInstructor(
  id: string,
  payload: InstructorMutationPayload,
  token?: string
): Promise<InstructorData> {
  return apiPut<InstructorData>(API_ENDPOINTS.INSTRUCTORS.BY_ID(id), payload, token);
}

/** Delete an instructor by id. */
export function deleteInstructor(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.INSTRUCTORS.BY_ID(id), token);
}

/**
 * Bulk-upload instructors from a CSV/XLSX file.
 *
 * Uses `fetch` directly (not `apiPost`) because the shared client forces a
 * JSON content-type, whereas multipart uploads must let the browser set the
 * `multipart/form-data` boundary itself. This is the API layer — the one place
 * a raw fetch is acceptable; components must never call it directly.
 */
export async function uploadInstructorsFile(file: File, token?: string): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(API_ENDPOINTS.INSTRUCTORS.BULK_UPLOAD, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message;
    throw new Error(message || 'Failed to upload instructors');
  }
  return data as BulkUploadResult;
}
