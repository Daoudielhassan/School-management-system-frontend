/**
 * Profile hooks: read the current student, update it (id resolved from the
 * cached `GET /me` response — there is no write `/me` route), change password.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchMyProfile, updateMyProfile, changeMyPassword } from '../api/profile.api';
import { STUDENT_PROFILE_QUERY_KEY } from '../constants';
import type { StudentProfile, StudentProfileUpdatePayload, ChangePasswordPayload } from '../types';

/** `GET /api/students/me`. */
export function useMyProfile() {
  const { token } = useAuth();

  return useQuery<StudentProfile>({
    queryKey: STUDENT_PROFILE_QUERY_KEY,
    queryFn: () => fetchMyProfile(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/**
 * `PUT /api/students/{id}`. Reads the id off the already-cached profile
 * query rather than re-fetching — callers must mount `useMyProfile()`
 * (directly or via a parent) before using this mutation.
 */
export function useUpdateMyProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<StudentProfile, Error, StudentProfileUpdatePayload>({
    mutationFn: (payload) => {
      const profile = queryClient.getQueryData<StudentProfile>(STUDENT_PROFILE_QUERY_KEY);
      if (!profile?.id) {
        throw new Error('Profile must be loaded before it can be updated.');
      }
      return updateMyProfile(profile.id, payload, token ?? undefined);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(STUDENT_PROFILE_QUERY_KEY, profile);
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
