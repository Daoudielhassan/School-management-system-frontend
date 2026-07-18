/**
 * Profile hooks: read the current manager, update it (id resolved from the
 * cached `GET /me` response), change password.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchMyManagerProfile, updateMyManagerProfile, changeMyPassword } from '../api/profile.api';
import { MANAGER_PROFILE_QUERY_KEY } from '../constants';
import type { ManagerProfile, ManagerProfileUpdatePayload, ChangePasswordPayload } from '../types';

/** `GET /api/managers/me`. */
export function useMyManagerProfile() {
  const { token } = useAuth();

  return useQuery<ManagerProfile>({
    queryKey: MANAGER_PROFILE_QUERY_KEY,
    queryFn: () => fetchMyManagerProfile(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/**
 * `PUT /api/managers/{id}`. Reads the id off the already-cached profile
 * query rather than re-fetching — callers must mount `useMyManagerProfile()`
 * (directly or via a parent) before using this mutation.
 */
export function useUpdateMyManagerProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ManagerProfile, Error, ManagerProfileUpdatePayload>({
    mutationFn: (payload) => {
      const profile = queryClient.getQueryData<ManagerProfile>(MANAGER_PROFILE_QUERY_KEY);
      if (!profile?.id) {
        throw new Error('Profile must be loaded before it can be updated.');
      }
      return updateMyManagerProfile(profile.id, payload, token ?? undefined);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(MANAGER_PROFILE_QUERY_KEY, profile);
    },
  });
}

/** `POST /api/auth/change-password` — `userId` is injected from the auth context. */
export function useChangeMyPassword() {
  const { token, userId } = useAuth();

  return useMutation<void, Error, Omit<ChangePasswordPayload, 'userId'>>({
    mutationFn: ({ currentPassword, newPassword }) => {
      if (!userId) throw new Error('No authenticated user.');
      return changeMyPassword({ userId, currentPassword, newPassword }, token ?? undefined);
    },
  });
}

/** The resolved `Manager.id` for the current user — used by every `{managerId}`-scoped endpoint below. */
export function useMyManagerId(): string | undefined {
  return useMyManagerProfile().data?.id;
}
