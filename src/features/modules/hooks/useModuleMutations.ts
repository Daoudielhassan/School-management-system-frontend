/**
 * Write-side hooks for the teaching modules feature.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createModule, updateModule, deleteModule } from '../api/modules.api';
import { MODULES_QUERY_KEY } from '../constants';
import type { TeachingModule, ModuleMutationPayload } from '../types';

export function useCreateModule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<TeachingModule, Error, ModuleMutationPayload>({
    mutationFn: (payload) => createModule(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY }),
  });
}

export interface UpdateModuleInput {
  id: string;
  payload: ModuleMutationPayload;
}

export function useUpdateModule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<TeachingModule, Error, UpdateModuleInput>({
    mutationFn: ({ id, payload }) => updateModule(id, payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY }),
  });
}

export function useDeleteModule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteModule(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY }),
  });
}
