/**
 * Schedule chain: profile → enrollments → class group → week sessions →
 * (optional) instructor names. Each step is its own hook so a page can stop
 * partway (e.g. just needs the class group id) without paying for the rest.
 */
import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyProfile } from './useMyProfile';
import { fetchMyEnrollments, fetchWeekSchedule, fetchInstructor } from '../api/schedule.api';
import {
  STUDENT_ENROLLMENTS_QUERY_KEY,
  STUDENT_SCHEDULE_QUERY_KEY,
  STUDENT_INSTRUCTOR_QUERY_KEY,
  ACTIVE_ENROLLMENT_STATUS,
} from '../constants';
import type { EnrollmentData, WeekSchedule, InstructorLite } from '../types';

/** `GET /api/enrollments?studentId={monStudentId}` — waits for the profile to resolve the id. */
export function useMyEnrollments() {
  const { token } = useAuth();
  const { data: profile } = useMyProfile();
  const studentId = profile?.id;

  return useQuery<EnrollmentData[]>({
    queryKey: [...STUDENT_ENROLLMENTS_QUERY_KEY, studentId],
    queryFn: () => fetchMyEnrollments(studentId as string, token ?? undefined),
    enabled: !!studentId && !!token,
    staleTime: 5 * 60_000,
  });
}

/** The class group the schedule is built for — the active enrollment, or the first one found. */
export function useMyActiveClassGroupId(): string | undefined {
  const { data: enrollments } = useMyEnrollments();

  return useMemo(
    () =>
      enrollments?.find((e) => e.status === ACTIVE_ENROLLMENT_STATUS)?.classGroupId ??
      enrollments?.[0]?.classGroupId,
    [enrollments]
  );
}

/** `GET /api/sessions/class-group/{classGroupId}/week/grouped?weekStart=...`. */
export function useMyWeekSchedule(weekStart: string) {
  const { token } = useAuth();
  const classGroupId = useMyActiveClassGroupId();

  return useQuery<WeekSchedule>({
    queryKey: [...STUDENT_SCHEDULE_QUERY_KEY, classGroupId, weekStart],
    queryFn: () => fetchWeekSchedule(classGroupId as string, weekStart, token ?? undefined),
    enabled: !!classGroupId && !!weekStart && !!token,
    staleTime: 60_000,
  });
}

/**
 * `GET /api/instructors/{instructorId}` for every distinct instructor in the
 * week, resolving id → display name. Optional per the contract — a failed or
 * pending lookup just leaves that instructor unnamed, it never blocks the
 * schedule itself.
 */
export function useInstructorNames(schedule?: WeekSchedule): Record<string, string> {
  const { token } = useAuth();

  const instructorIds = useMemo(() => {
    if (!schedule) return [];
    const ids = new Set<string>();
    Object.values(schedule).forEach((sessions) =>
      sessions.forEach((s) => s.instructorId && ids.add(s.instructorId))
    );
    return Array.from(ids);
  }, [schedule]);

  const results = useQueries({
    queries: instructorIds.map((id) => ({
      queryKey: [...STUDENT_INSTRUCTOR_QUERY_KEY, id],
      queryFn: () => fetchInstructor(id, token ?? undefined),
      enabled: !!token,
      staleTime: 10 * 60_000,
    })),
  });

  return useMemo(() => {
    const map: Record<string, string> = {};
    instructorIds.forEach((id, i) => {
      const data = results[i]?.data as InstructorLite | undefined;
      if (data) map[id] = data.name;
    });
    return map;
  }, [instructorIds, results]);
}

export interface UseMyScheduleResult {
  schedule?: WeekSchedule;
  instructorNames: Record<string, string>;
  isLoading: boolean;
  isError: boolean;
}

/** Composed hook: a full week, with room + instructor name resolved per session. */
export function useMySchedule(weekStart: string): UseMyScheduleResult {
  const scheduleQuery = useMyWeekSchedule(weekStart);
  const instructorNames = useInstructorNames(scheduleQuery.data);

  return {
    schedule: scheduleQuery.data,
    instructorNames,
    isLoading: scheduleQuery.isLoading,
    isError: scheduleQuery.isError,
  };
}
