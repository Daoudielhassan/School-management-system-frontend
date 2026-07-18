/**
 * Profile hooks: read the current instructor, update it (id resolved from
 * the cached `GET /me` response), change password.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchMyInstructorProfile, updateMyInstructorProfile, changeMyPassword } from '../api/profile.api';
import { INSTRUCTOR_PROFILE_QUERY_KEY } from '../constants';
import type { InstructorProfile, InstructorProfileUpdatePayload, ChangePasswordPayload } from '../types';

/** `GET /api/instructors/me`. */
export function useMyInstructorProfile() {
  const { token } = useAuth();

  return useQuery<InstructorProfile>({
    queryKey: INSTRUCTOR_PROFILE_QUERY_KEY,
    queryFn: () => fetchMyInstructorProfile(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/**
 * `PUT /api/instructors/{id}`. Reads the id off the already-cached profile
 * query rather than re-fetching — callers must mount `useMyInstructorProfile()`
 * (directly or via a parent) before using this mutation.
 */
export function useUpdateMyInstructorProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<InstructorProfile, Error, InstructorProfileUpdatePayload>({
    mutationFn: (payload) => {
      const profile = queryClient.getQueryData<InstructorProfile>(INSTRUCTOR_PROFILE_QUERY_KEY);
      if (!profile?.id) {
        throw new Error('Profile must be loaded before it can be updated.');
      }
      return updateMyInstructorProfile(profile.id, payload, token ?? undefined);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(INSTRUCTOR_PROFILE_QUERY_KEY, profile);
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

/** The resolved `Instructor.id` for the current user — used by every `{instructorId}`-scoped endpoint below. */
export function useMyInstructorId(): string | undefined {
  return useMyInstructorProfile().data?.id;
}
