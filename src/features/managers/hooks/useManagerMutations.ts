/**
 * Write-side hooks for the managers feature. Every mutation invalidates the
 * relevant caches on success; user-facing toasts stay in the component layer
 * so these hooks remain reusable and UI-agnostic.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createManager, updateManager, deleteManager, updateManagerStatus } from '../api/managers.api';
import { MANAGERS_QUERY_KEY } from '../constants';
import type {
  ManagerCreatePayload,
  ManagerUpdatePayload,
  CreateManagerResponse,
  ManagerData,
  ManagerStatus,
} from '../types';

/** Create a manager. The response carries a one-time `temporaryPassword` to display. */
export function useCreateManager() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<CreateManagerResponse, Error, ManagerCreatePayload>({
    mutationFn: (payload) => createManager(payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGERS_QUERY_KEY });
    },
  });
}

export interface UpdateManagerInput {
  id: string;
  payload: ManagerUpdatePayload;
}

/** Update an existing manager. */
export function useUpdateManager() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ManagerData, Error, UpdateManagerInput>({
    mutationFn: ({ id, payload }) => updateManager(id, payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGERS_QUERY_KEY });
    },
  });
}

/** Delete a manager by id. */
export function useDeleteManager() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteManager(id, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGERS_QUERY_KEY });
    },
  });
}

export interface UpdateManagerStatusInput {
  id: string;
  status: ManagerStatus;
}

/** Change a manager's status (`ACTIVE`/`ON_LEAVE`/`SUSPENDED`/`TERMINATED`). */
export function useUpdateManagerStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ManagerData, Error, UpdateManagerStatusInput>({
    mutationFn: ({ id, status }) => updateManagerStatus(id, status, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGERS_QUERY_KEY });
    },
  });
}
