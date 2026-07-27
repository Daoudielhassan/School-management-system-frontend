import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyManagerId } from './useMyProfile';
import {
  fetchTeachingAssignments,
  createTeachingAssignment,
  cancelTeachingAssignment,
  fetchSubjects,
  fetchModulesByDepartmentAndLevel,
  fetchSubjectsByModule,
  fetchInstructors,
  fetchAcademicYears,
} from '../api/teachingAssignments.api';
import {
  MANAGER_TEACHING_ASSIGNMENTS_QUERY_KEY,
  MANAGER_SUBJECTS_QUERY_KEY,
  MANAGER_MODULES_QUERY_KEY,
  MANAGER_MODULE_SUBJECTS_QUERY_KEY,
  MANAGER_INSTRUCTORS_QUERY_KEY,
  MANAGER_ACADEMIC_YEARS_QUERY_KEY,
} from '../constants';
import type {
  TeachingAssignment,
  TeachingAssignmentCreatePayload,
  ModuleLite,
  SubjectLite,
  InstructorLite,
  AcademicYearLite,
} from '../types';

/** `GET /api/teaching-assignments?classGroupId=` — scoped to a single class group at a time. */
export function useTeachingAssignments(classGroupId?: string) {
  const { token } = useAuth();

  return useQuery<TeachingAssignment[]>({
    queryKey: [...MANAGER_TEACHING_ASSIGNMENTS_QUERY_KEY, classGroupId],
    queryFn: () => fetchTeachingAssignments({ classGroupId }, token ?? undefined),
    enabled: !!token && !!classGroupId,
    staleTime: 60_000,
  });
}

/** `GET /api/subjects` — lookup list for the create-assignment form. */
export function useManagerSubjects() {
  const { token } = useAuth();

  return useQuery<SubjectLite[]>({
    queryKey: MANAGER_SUBJECTS_QUERY_KEY,
    queryFn: () => fetchSubjects(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

/**
 * `GET /api/modules?departmentId=&level=` — the modules of a class group's
 * filière, narrowed to its level. Used for the create-assignment form's
 * module step; disabled (returns []) until both are known.
 */
export function useModulesFor(departmentId?: string, level?: number) {
  const { token } = useAuth();

  return useQuery<ModuleLite[]>({
    queryKey: [...MANAGER_MODULES_QUERY_KEY, departmentId, level],
    queryFn: () => fetchModulesByDepartmentAndLevel({ departmentId, level }, token ?? undefined),
    enabled: !!token && !!departmentId && level != null,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/subjects?moduleId=` — the subjects of a single module, for the create-assignment form. */
export function useSubjectsByModule(moduleId?: string) {
  const { token } = useAuth();

  return useQuery<SubjectLite[]>({
    queryKey: [...MANAGER_MODULE_SUBJECTS_QUERY_KEY, moduleId],
    queryFn: () => fetchSubjectsByModule(moduleId, token ?? undefined),
    enabled: !!token && !!moduleId,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/instructors`. */
export function useManagerInstructors() {
  const { token } = useAuth();

  return useQuery<InstructorLite[]>({
    queryKey: MANAGER_INSTRUCTORS_QUERY_KEY,
    queryFn: () => fetchInstructors(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/academic-years`. */
export function useManagerAcademicYears() {
  const { token } = useAuth();

  return useQuery<AcademicYearLite[]>({
    queryKey: MANAGER_ACADEMIC_YEARS_QUERY_KEY,
    queryFn: () => fetchAcademicYears(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

/** `POST /api/managers/{managerId}/teaching-assignments`. */
export function useCreateTeachingAssignment() {
  const { token } = useAuth();
  const managerId = useMyManagerId();
  const queryClient = useQueryClient();

  return useMutation<TeachingAssignment, Error, TeachingAssignmentCreatePayload>({
    mutationFn: (payload) => {
      if (!managerId) throw new Error('Manager profile not loaded.');
      return createTeachingAssignment(managerId, payload, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_TEACHING_ASSIGNMENTS_QUERY_KEY });
    },
  });
}

/** `PATCH /api/teaching-assignments/{id}/cancel`. */
export function useCancelTeachingAssignment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<TeachingAssignment, Error, string>({
    mutationFn: (id) => cancelTeachingAssignment(id, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_TEACHING_ASSIGNMENTS_QUERY_KEY });
    },
  });
}
