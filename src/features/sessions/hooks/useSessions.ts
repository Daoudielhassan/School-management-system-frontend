/**
 * React Query hooks for session data. (Relocated from src/lib/hooks into the
 * sessions feature — the canonical home for session data access.)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

export interface SessionData {
  id: string;
  managerId?: string;
  departmentId?: string;
  classGroupId?: string;
  teachingModuleId?: string;
  subjectId?: string;
  instructorId?: string;
  startsAt: string;
  endsAt: string;
  room?: string;
  createdAt: string;
}

export interface CreateSessionPayload {
  managerId?: string;
  departmentId: string;
  classGroupId: string;
  teachingModuleId?: string;
  subjectId: string;
  instructorId: string;
  startsAt: string;
  endsAt: string;
  room?: string;
}

export const SESSIONS_QUERY_KEY = ['sessions'] as const;

export function useSessions(params?: {
  managerId?: string;
  classGroupId?: string;
  instructorId?: string;
}) {
  const { token } = useAuth();

  return useQuery<SessionData[]>({
    queryKey: [...SESSIONS_QUERY_KEY, params],
    queryFn: () => apiGet(API_ENDPOINTS.SESSIONS.FILTER(params), token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useSessionsByInstructorAndDate(instructorId: string, date: string) {
  const { token } = useAuth();

  return useQuery<SessionData[]>({
    queryKey: [...SESSIONS_QUERY_KEY, 'instructor', instructorId, 'date', date],
    queryFn: () =>
      apiGet(API_ENDPOINTS.SESSIONS.BY_INSTRUCTOR_AND_DATE(instructorId, date), token ?? undefined),
    enabled: !!token && !!instructorId && !!date,
    staleTime: 60_000,
  });
}

export function useSessionsByClassGroupWeek(classGroupId: string, weekStart: string) {
  const { token } = useAuth();

  return useQuery<Record<string, SessionData[]>>({
    queryKey: [...SESSIONS_QUERY_KEY, 'class-group', classGroupId, 'week', weekStart],
    queryFn: () =>
      apiGet(
        API_ENDPOINTS.SESSIONS.BY_CLASSGROUP_WEEK_GROUPED(classGroupId, weekStart),
        token ?? undefined
      ),
    enabled: !!token && !!classGroupId && !!weekStart,
    staleTime: 60_000,
  });
}

export function useUpcomingSessions(params?: {
  instructorId?: string;
  classGroupId?: string;
  limit?: number;
}) {
  const { token } = useAuth();

  return useQuery<SessionData[]>({
    queryKey: [...SESSIONS_QUERY_KEY, 'upcoming', params],
    queryFn: () => apiGet(API_ENDPOINTS.SESSIONS.UPCOMING(params), token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateSession() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SessionData, Error, CreateSessionPayload>({
    mutationFn: (payload) => apiPost(API_ENDPOINTS.SESSIONS.BASE, payload, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}

export function useDeleteSession() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiDelete(API_ENDPOINTS.SESSIONS.BY_ID(id), token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}
