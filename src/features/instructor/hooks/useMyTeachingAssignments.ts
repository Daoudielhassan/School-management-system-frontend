/**
 * "What do I teach" hooks — every query waits on `useMyInstructorId()` first,
 * the instructor's own id resolved server-side, never passed by the client.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyInstructorId } from './useMyProfile';
import { fetchMyTeachingAssignments, fetchSubjects, fetchClassGroups, fetchAcademicYears } from '../api/teachingAssignments.api';
import { INSTRUCTOR_TEACHING_ASSIGNMENTS_QUERY_KEY, INSTRUCTOR_SUBJECTS_QUERY_KEY } from '../constants';
import type { TeachingAssignment, SubjectLite, ClassGroupLite, AcademicYearLite } from '../types';

/** `GET /api/teaching-assignments?instructorId=<self>`. */
export function useMyTeachingAssignments() {
  const { token } = useAuth();
  const instructorId = useMyInstructorId();

  return useQuery<TeachingAssignment[]>({
    queryKey: [...INSTRUCTOR_TEACHING_ASSIGNMENTS_QUERY_KEY, instructorId],
    queryFn: () => fetchMyTeachingAssignments(instructorId as string, token ?? undefined),
    enabled: !!instructorId && !!token,
    staleTime: 60_000,
  });
}

/** `GET /api/subjects` — lookup list used to resolve subject names for display. */
export function useSubjects() {
  const { token } = useAuth();

  return useQuery<SubjectLite[]>({
    queryKey: INSTRUCTOR_SUBJECTS_QUERY_KEY,
    queryFn: () => fetchSubjects(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/class-groups` — lookup list used to resolve class group names for display. */
export function useClassGroups() {
  const { token } = useAuth();

  return useQuery<ClassGroupLite[]>({
    queryKey: ['instructor', 'class-groups'],
    queryFn: () => fetchClassGroups(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/academic-years` — lookup list used to resolve academic year codes for display. */
export function useAcademicYears() {
  const { token } = useAuth();

  return useQuery<AcademicYearLite[]>({
    queryKey: ['instructor', 'academic-years'],
    queryFn: () => fetchAcademicYears(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

/** Only the ACTIVE assignments — the set a professor may still teach/grade against. */
export function useMyActiveTeachingAssignments() {
  const query = useMyTeachingAssignments();
  return {
    ...query,
    data: (query.data ?? []).filter((a) => a.status === 'ACTIVE'),
  };
}
