/**
 * Write-side hooks for the users feature. Each invalidates the users cache on
 * success; toasts stay in the component layer.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { generateTemporaryPassword } from '@/lib/generate-temporary-password';
import { createUser, updateUser, deleteUser, toggleUser, resetUserPassword } from '../api/users.api';
import { USERS_QUERY_KEY } from '../constants';
import type { UserData, CreateUserPayload, UpdateUserPayload } from '../types';

export function useCreateUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<UserData, Error, CreateUserPayload>({
    mutationFn: (payload) => createUser(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export interface UpdateUserInput {
  id: string;
  payload: UpdateUserPayload;
}

export function useUpdateUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<UserData, Error, UpdateUserInput>({
    mutationFn: ({ id, payload }) => updateUser(id, payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useDeleteUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteUser(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useToggleUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; enable: boolean }>({
    mutationFn: ({ id, enable }) => toggleUser(id, enable, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

/**
 * Resets a user's password to a freshly generated one-time value, shown to
 * the admin exactly once — it's never stored or retrievable afterward, same
 * as at account creation. Works for any role (student, instructor, manager,
 * admin), unlike the instructor-only reset on the Professeurs page.
 */
export function useResetUserPassword() {
  const { token } = useAuth();

  return useMutation<{ temporaryPassword: string }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const temporaryPassword = generateTemporaryPassword();
      await resetUserPassword(id, temporaryPassword, token ?? undefined);
      return { temporaryPassword };
    },
  });
}
