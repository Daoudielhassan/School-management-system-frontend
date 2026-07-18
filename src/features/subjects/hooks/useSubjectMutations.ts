/**
 * Write-side hooks for the subjects feature.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createSubject, updateSubject, deleteSubject } from '../api/subjects.api';
import { SUBJECTS_QUERY_KEY } from '../constants';
import type { Subject, SubjectMutationPayload } from '../types';

export function useCreateSubject() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Subject, Error, SubjectMutationPayload>({
    mutationFn: (payload) => createSubject(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
  });
}

export interface UpdateSubjectInput {
  id: string;
  payload: SubjectMutationPayload;
}

export function useUpdateSubject() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Subject, Error, UpdateSubjectInput>({
    mutationFn: ({ id, payload }) => updateSubject(id, payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
  });
}

export function useDeleteSubject() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteSubject(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
  });
}
