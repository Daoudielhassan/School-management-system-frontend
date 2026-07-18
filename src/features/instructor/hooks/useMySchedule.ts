/**
 * Schedule hooks — every query waits on `useMyInstructorId()` first, the
 * instructor's own id resolved server-side, never passed by the client.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyInstructorId } from './useMyProfile';
import { useMyTeachingAssignments, useSubjects } from './useMyTeachingAssignments';
import { fetchMySessions, fetchMySessionsByDate, fetchMyUpcomingSessions } from '../api/sessions.api';
import {
  INSTRUCTOR_SESSIONS_QUERY_KEY,
  INSTRUCTOR_UPCOMING_SESSIONS_QUERY_KEY,
} from '../constants';
import type { SessionData } from '../types';

/** `GET /api/sessions/instructor/{instructorId}`. */
export function useMySessions() {
  const { token } = useAuth();
  const instructorId = useMyInstructorId();

  return useQuery<SessionData[]>({
    queryKey: [...INSTRUCTOR_SESSIONS_QUERY_KEY, instructorId],
    queryFn: () => fetchMySessions(instructorId as string, token ?? undefined),
    enabled: !!instructorId && !!token,
    staleTime: 60_000,
  });
}

/** `GET /api/sessions/instructor/{instructorId}/date/{date}` — `date` as `yyyy-MM-dd`. */
export function useMySessionsByDate(date?: string) {
  const { token } = useAuth();
  const instructorId = useMyInstructorId();

  return useQuery<SessionData[]>({
    queryKey: [...INSTRUCTOR_SESSIONS_QUERY_KEY, instructorId, date],
    queryFn: () => fetchMySessionsByDate(instructorId as string, date as string, token ?? undefined),
    enabled: !!instructorId && !!token && !!date,
    staleTime: 60_000,
  });
}

/** `GET /api/sessions/upcoming?instructorId=<self>&limit=`. */
export function useMyUpcomingSessions(limit = 5) {
  const { token } = useAuth();
  const instructorId = useMyInstructorId();

  return useQuery<SessionData[]>({
    queryKey: [...INSTRUCTOR_UPCOMING_SESSIONS_QUERY_KEY, instructorId, limit],
    queryFn: () => fetchMyUpcomingSessions(instructorId as string, limit, token ?? undefined),
    enabled: !!instructorId && !!token,
    staleTime: 60_000,
  });
}

export interface SessionDetails {
  subjectName: string;
  classGroupId: string;
}

/**
 * Resolves a flat list of sessions' `teachingAssignmentId` to a subject name
 * and class group, using the instructor's own (already-fetched) teaching
 * assignments — no extra per-session round trip needed, unlike the
 * manager-side equivalent (a professor's own assignment list is small).
 */
export function useMySessionDetails(sessions: SessionData[]): Record<string, SessionDetails> {
  const { data: assignments = [] } = useMyTeachingAssignments();
  const { data: subjects = [] } = useSubjects();

  return useMemo(() => {
    const assignmentById = new Map(assignments.map((a) => [a.id, a]));
    const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));

    const details: Record<string, SessionDetails> = {};
    sessions.forEach((session) => {
      const assignment = assignmentById.get(session.teachingAssignmentId);
      if (!assignment) return;
      details[session.teachingAssignmentId] = {
        subjectName: subjectNameById.get(assignment.subjectId) ?? 'Matière',
        classGroupId: assignment.classGroupId,
      };
    });
    return details;
  }, [sessions, assignments, subjects]);
}
