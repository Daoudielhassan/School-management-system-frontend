/**
 * Write-side hooks for the discipline feature. Invalidate the whole discipline
 * cache (cases + stats) on success.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createCase, updateCase, deleteCase } from '../api/discipline.api';
import { DISCIPLINE_QUERY_KEY } from '../constants';
import type { DisciplinaryCase, CreateCasePayload, UpdateCasePayload } from '../types';

export function useCreateCase() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<DisciplinaryCase, Error, CreateCasePayload>({
    mutationFn: (payload) => createCase(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DISCIPLINE_QUERY_KEY }),
  });
}

export interface UpdateCaseInput {
  id: string;
  payload: UpdateCasePayload;
}

export function useUpdateCase() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<DisciplinaryCase, Error, UpdateCaseInput>({
    mutationFn: ({ id, payload }) => updateCase(id, payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DISCIPLINE_QUERY_KEY }),
  });
}

export function useDeleteCase() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteCase(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DISCIPLINE_QUERY_KEY }),
  });
}
