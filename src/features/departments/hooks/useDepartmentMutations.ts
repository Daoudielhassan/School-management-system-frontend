/**
 * Write-side hooks for the departments feature.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createDepartment, updateDepartment, deleteDepartment } from '../api/departments.api';
import { DEPARTMENTS_QUERY_KEY } from '../constants';
import type { Department, DepartmentMutationPayload } from '../types';

export function useCreateDepartment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Department, Error, DepartmentMutationPayload>({
    mutationFn: (payload) => createDepartment(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
}

export interface UpdateDepartmentInput {
  id: string;
  payload: DepartmentMutationPayload;
}

export function useUpdateDepartment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Department, Error, UpdateDepartmentInput>({
    mutationFn: ({ id, payload }) => updateDepartment(id, payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
}

export function useDeleteDepartment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteDepartment(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
}
