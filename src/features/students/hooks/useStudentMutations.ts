/**
 * Write-side hooks for the students feature. Every mutation invalidates the
 * relevant caches on success; user-facing toasts stay in the component layer so
 * these hooks remain reusable and UI-agnostic.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  createStudent,
  enrollStudent,
  updateStudent,
  deleteStudent,
  uploadStudentsFile,
  fetchStudentAttestation,
} from '../api/students.api';
import { STUDENTS_QUERY_KEY } from '../constants';
import type {
  StudentMutationPayload,
  CreateStudentResponse,
  BulkUploadResult,
} from '../types';

export interface CreateStudentInput {
  payload: StudentMutationPayload;
  /** Optional class group to enroll the new student into. */
  classGroupId?: string;
}

export interface CreateStudentResult {
  student: CreateStudentResponse;
  /** True when the student was created but the follow-up enrollment failed. */
  enrollmentFailed: boolean;
}

/**
 * Create a student and, if a class was chosen, enroll them. A failed enrollment
 * does not fail the whole mutation — the student exists; the caller is told via
 * `enrollmentFailed` so it can warn instead of erroring.
 */
export function useCreateStudent() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<CreateStudentResult, Error, CreateStudentInput>({
    mutationFn: async ({ payload, classGroupId }) => {
      const student = await createStudent(payload, token ?? undefined);

      let enrollmentFailed = false;
      if (classGroupId && student?.id) {
        try {
          await enrollStudent({ studentId: student.id, classGroupId }, token ?? undefined);
        } catch {
          enrollmentFailed = true;
        }
      }
      return { student, enrollmentFailed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
}

export interface UpdateStudentInput {
  id: string;
  payload: StudentMutationPayload;
}

/** Update an existing student. */
export function useUpdateStudent() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateStudentInput>({
    mutationFn: ({ id, payload }) => updateStudent(id, payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
}

/** Delete a student by id. */
export function useDeleteStudent() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteStudent(id, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
}

/** Generate the student's "Attestation de scolarité" — returns the raw HTML document, no cache. */
export function useGenerateStudentAttestation() {
  const { token } = useAuth();

  return useMutation<string, Error, string>({
    mutationFn: (id) => fetchStudentAttestation(id, token ?? undefined),
  });
}

export interface UploadStudentsInput {
  file: File;
  /** Optional class group to enroll every successfully created student into. */
  classGroupId?: string;
}

/** Bulk-upload students from a CSV/XLSX file, optionally enrolling them all into a class group. */
export function useUploadStudents() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BulkUploadResult, Error, UploadStudentsInput>({
    mutationFn: ({ file, classGroupId }) => uploadStudentsFile(file, classGroupId, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
}
