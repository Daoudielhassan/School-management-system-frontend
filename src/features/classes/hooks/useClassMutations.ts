/**
 * Write-side hooks for the classes feature. Each invalidates the classes cache
 * on success; toasts stay in the component layer.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createClass, updateClass, deleteClass } from '../api/classes.api';
import { CLASSES_QUERY_KEY } from '../constants';
import type { ClassGroup, ClassMutationPayload } from '../types';

export function useCreateClass() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ClassGroup, Error, ClassMutationPayload>({
    mutationFn: (payload) => createClass(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY }),
  });
}

export interface UpdateClassInput {
  id: string;
  payload: ClassMutationPayload;
}

export function useUpdateClass() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ClassGroup, Error, UpdateClassInput>({
    mutationFn: ({ id, payload }) => updateClass(id, payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY }),
  });
}

export function useDeleteClass() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteClass(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY }),
  });
}
