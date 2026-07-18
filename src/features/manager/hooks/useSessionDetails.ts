/**
 * Resolves a flat list of sessions' `teachingAssignmentId` → subject/instructor
 * display names, via the two-hop chain `Session.teachingAssignmentId` →
 * `TeachingAssignment.{subjectId,instructorId}` → `Subject.name`/`Instructor.name`
 * (§2.15/§2.19 — `Session` no longer carries those directly). Used by the
 * dashboard's "today" widget and the department sessions table. Optional by
 * nature — a failed or pending lookup just leaves that session unnamed.
 */
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchTeachingAssignment, fetchSubjects, fetchInstructors } from '../api/teachingAssignments.api';
import {
  MANAGER_TEACHING_ASSIGNMENTS_QUERY_KEY,
  MANAGER_SUBJECTS_QUERY_KEY,
  MANAGER_INSTRUCTORS_QUERY_KEY,
} from '../constants';
import type { SessionData, TeachingAssignment } from '../types';

export interface SessionDetails {
  subjectName: string;
  instructorName: string;
  classGroupId: string;
}

export function useSessionDetails(sessions: SessionData[]): Record<string, SessionDetails> {
  const { token } = useAuth();

  const assignmentIds = useMemo(() => {
    const ids = new Set<string>();
    sessions.forEach((s) => s.teachingAssignmentId && ids.add(s.teachingAssignmentId));
    return Array.from(ids);
  }, [sessions]);

  const assignmentResults = useQueries({
    queries: assignmentIds.map((id) => ({
      queryKey: [...MANAGER_TEACHING_ASSIGNMENTS_QUERY_KEY, 'byId', id],
      queryFn: () => fetchTeachingAssignment(id, token ?? undefined),
      enabled: !!token,
      staleTime: 5 * 60_000,
    })),
  });

  const subjectsQuery = useQueries({
    queries: [
      {
        queryKey: MANAGER_SUBJECTS_QUERY_KEY,
        queryFn: () => fetchSubjects(token ?? undefined),
        enabled: !!token && assignmentIds.length > 0,
        staleTime: 5 * 60_000,
      },
    ],
  })[0];

  const instructorsQuery = useQueries({
    queries: [
      {
        queryKey: MANAGER_INSTRUCTORS_QUERY_KEY,
        queryFn: () => fetchInstructors(token ?? undefined),
        enabled: !!token && assignmentIds.length > 0,
        staleTime: 5 * 60_000,
      },
    ],
  })[0];

  return useMemo(() => {
    const subjects = (subjectsQuery.data as { id: string; name: string }[] | undefined) ?? [];
    const instructors = (instructorsQuery.data as { id: string; name: string }[] | undefined) ?? [];
    const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
    const instructorNameById = new Map(instructors.map((i) => [i.id, i.name]));

    const details: Record<string, SessionDetails> = {};
    assignmentIds.forEach((assignmentId, i) => {
      const assignment = assignmentResults[i]?.data as TeachingAssignment | undefined;
      if (!assignment) return;
      details[assignmentId] = {
        subjectName: subjectNameById.get(assignment.subjectId) ?? 'Matière',
        instructorName: instructorNameById.get(assignment.instructorId) ?? 'Instructeur',
        classGroupId: assignment.classGroupId,
      };
    });
    return details;
  }, [assignmentIds, assignmentResults, subjectsQuery.data, instructorsQuery.data]);
}
