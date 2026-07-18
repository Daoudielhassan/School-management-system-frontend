import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { processRepetition } from '../api/repetition.api';
import { useMyManagerId } from './useMyProfile';
import type { RepetitionPayload } from '../types';

/**
 * `POST /api/managers/{managerId}/department/repetitions`. Invalidates every
 * class-roster query (source and target cohorts both change) rather than
 * targeting one classGroupId — cheap, and this action is infrequent.
 */
export function useProcessRepetition() {
  const { token } = useAuth();
  const managerId = useMyManagerId();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepetitionPayload>({
    mutationFn: (payload) => {
      if (!managerId) throw new Error('Manager profile not loaded.');
      return processRepetition(managerId, payload, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'class-students'] });
    },
  });
}
