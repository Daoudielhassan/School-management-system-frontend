/**
 * Grades hooks — writes are additionally verified server-side against the
 * instructor's own active teaching assignments (`InstructorAccessGuard`);
 * `instructorId` in payloads is always the caller's own id, never editable.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyInstructorId } from './useMyProfile';
import { fetchMyGrades, createGrade, updateGrade, deleteGrade } from '../api/grades.api';
import { INSTRUCTOR_GRADES_QUERY_KEY } from '../constants';
import type { Grade, GradeMutationPayload } from '../types';

/** `GET /api/grades?instructorId=<self>`. */
export function useMyGrades() {
  const { token } = useAuth();
  const instructorId = useMyInstructorId();

  return useQuery<Grade[]>({
    queryKey: [...INSTRUCTOR_GRADES_QUERY_KEY, instructorId],
    queryFn: () => fetchMyGrades(instructorId as string, token ?? undefined),
    enabled: !!instructorId && !!token,
    staleTime: 30_000,
  });
}

export function useCreateGrade() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Grade, Error, GradeMutationPayload>({
    mutationFn: (payload) => createGrade(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INSTRUCTOR_GRADES_QUERY_KEY }),
  });
}

export interface UpdateGradeInput {
  id: string;
  payload: GradeMutationPayload;
}

export function useUpdateGrade() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Grade, Error, UpdateGradeInput>({
    mutationFn: ({ id, payload }) => updateGrade(id, payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INSTRUCTOR_GRADES_QUERY_KEY }),
  });
}

export function useDeleteGrade() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteGrade(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INSTRUCTOR_GRADES_QUERY_KEY }),
  });
}
