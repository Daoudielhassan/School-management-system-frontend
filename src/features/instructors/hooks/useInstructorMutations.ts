/**
 * Write-side hooks for the instructors feature. Every mutation invalidates
 * the relevant cache on success; user-facing toasts stay in the component
 * layer so these hooks remain reusable and UI-agnostic.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  createInstructor,
  updateInstructor,
  deleteInstructor,
  uploadInstructorsFile,
  resetInstructorPassword,
} from '../api/instructors.api';
import { generateTemporaryPassword } from '../lib/generate-temporary-password';
import { INSTRUCTORS_QUERY_KEY } from '../constants';
import type {
  InstructorCreatePayload,
  InstructorMutationPayload,
  CreateInstructorResponse,
  InstructorData,
  BulkUploadResult,
} from '../types';

/** Create an instructor. The response carries a one-time `temporaryPassword` to display. */
export function useCreateInstructor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<CreateInstructorResponse, Error, InstructorCreatePayload>({
    mutationFn: (payload) => createInstructor(payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTORS_QUERY_KEY });
    },
  });
}

export interface UpdateInstructorInput {
  id: string;
  payload: InstructorMutationPayload;
}

/** Update an existing instructor. */
export function useUpdateInstructor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<InstructorData, Error, UpdateInstructorInput>({
    mutationFn: ({ id, payload }) => updateInstructor(id, payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTORS_QUERY_KEY });
    },
  });
}

/** Delete an instructor by id. */
export function useDeleteInstructor() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteInstructor(id, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTORS_QUERY_KEY });
    },
  });
}

/**
 * Resets an instructor's password to a freshly generated one-time value,
 * shown to the admin exactly once (they must relay it out-of-band — it's
 * never stored or retrievable afterward, same as at account creation).
 */
export function useResetInstructorPassword() {
  const { token } = useAuth();

  return useMutation<{ temporaryPassword: string }, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const temporaryPassword = generateTemporaryPassword();
      await resetInstructorPassword(userId, temporaryPassword, token ?? undefined);
      return { temporaryPassword };
    },
  });
}

/** Bulk-upload instructors from a CSV/XLSX file. */
export function useUploadInstructors() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<BulkUploadResult, Error, File>({
    mutationFn: (file) => uploadInstructorsFile(file, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTRUCTORS_QUERY_KEY });
    },
  });
}
