/**
 * Students API layer — thin, framework-agnostic wrappers over the shared HTTP
 * client. No React, no cache logic here: functions take a `token` and return
 * promises. Hooks (in ../hooks) add React Query, auth and cache invalidation.
 */
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from '@/config/api';
import type {
  StudentData,
  CreateStudentResponse,
  StudentMutationPayload,
  BulkUploadResult,
  Department,
  ClassGroup,
  EnrollmentData,
  StudentReferenceData,
} from '../types';
import { ENROLLMENT_ACTIVE_STATUS } from '../constants';

/** Fetch the full students list. */
export function fetchStudents(token?: string): Promise<StudentData[]> {
  return apiGet<StudentData[]>(API_ENDPOINTS.STUDENTS.BASE, token);
}

/**
 * Fetch the reference data powering the filters (departments, class groups,
 * enrollments) in parallel. Each list defaults to `[]` if the shape is
 * unexpected so a single failing endpoint never breaks the others.
 */
export async function fetchStudentReferenceData(token?: string): Promise<StudentReferenceData> {
  const [departments, classGroups, enrollments] = await Promise.all([
    apiGet<Department[]>(API_ENDPOINTS.DEPARTMENTS.BASE, token),
    apiGet<ClassGroup[]>(API_ENDPOINTS.CLASSES.BASE, token),
    apiGet<EnrollmentData[]>(API_ENDPOINTS.ENROLLMENTS.BASE, token),
  ]);

  return {
    departments: Array.isArray(departments) ? departments : [],
    classGroups: Array.isArray(classGroups) ? classGroups : [],
    enrollments: Array.isArray(enrollments) ? enrollments : [],
  };
}

/** Create a student. The response may carry a one-time `temporaryPassword`. */
export function createStudent(
  payload: StudentMutationPayload,
  token?: string
): Promise<CreateStudentResponse> {
  return apiPost<CreateStudentResponse>(API_ENDPOINTS.STUDENTS.BASE, payload, token);
}

/** Enroll a student into a class group with an ACTIVE status. */
export function enrollStudent(
  input: { studentId: string; classGroupId: string },
  token?: string
): Promise<unknown> {
  return apiPost(
    API_ENDPOINTS.ENROLLMENTS.BASE,
    {
      studentId: input.studentId,
      classGroupId: input.classGroupId,
      status: ENROLLMENT_ACTIVE_STATUS,
    },
    token
  );
}

/** Update an existing student. */
export function updateStudent(
  id: string,
  payload: StudentMutationPayload,
  token?: string
): Promise<StudentData> {
  return apiPut<StudentData>(API_ENDPOINTS.STUDENTS.BY_ID(id), payload, token);
}

/** Delete a student by id. */
export function deleteStudent(id: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.STUDENTS.BY_ID(id), token);
}

/**
 * Bulk-upload students from a CSV/XLSX file.
 *
 * Uses `fetch` directly (not `apiPost`) because the shared client forces a
 * JSON content-type, whereas multipart uploads must let the browser set the
 * `multipart/form-data` boundary itself. This is the API layer — the one place
 * a raw fetch is acceptable; components must never call it directly.
 */
export async function uploadStudentsFile(
  file: File,
  token?: string
): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(API_ENDPOINTS.STUDENTS.BULK_UPLOAD, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data: BulkUploadResult = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to upload students');
  }
  return data;
}
