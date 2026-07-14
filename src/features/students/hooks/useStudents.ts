/**
 * Read-side hooks for the students feature.
 *
 * - `useStudents`           → the raw students list (React Query).
 * - `useStudentReferenceData` → departments / class groups / enrollments for filters.
 * - `useStudentsTable`      → composes list + reference data + filters into the
 *                             paginated rows a table renders (pure `useMemo`).
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchStudents, fetchStudentReferenceData } from '../api/students.api';
import { filterAndPaginateStudents } from '../lib/filter-students';
import {
  STUDENTS_QUERY_KEY,
  STUDENT_REFERENCE_QUERY_KEY,
  STUDENTS_PAGE_SIZE,
} from '../constants';
import type {
  StudentData,
  StudentReferenceData,
  StudentFilters,
  PagedStudents,
} from '../types';

const EMPTY_REFERENCE: StudentReferenceData = {
  departments: [],
  classGroups: [],
  enrollments: [],
};

/** Fetch the full students list. */
export function useStudents() {
  const { token } = useAuth();

  return useQuery<StudentData[]>({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: () => fetchStudents(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** Fetch reference data used to build the department/class filters. */
export function useStudentReferenceData() {
  const { token } = useAuth();

  return useQuery<StudentReferenceData>({
    queryKey: STUDENT_REFERENCE_QUERY_KEY,
    queryFn: () => fetchStudentReferenceData(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

export interface UseStudentsTableResult {
  /** The current page of filtered students. */
  paged: PagedStudents;
  /** Reference data (also exposes the dropdown options). */
  reference: StudentReferenceData;
  /** Class groups scoped to the selected department (for the class dropdown). */
  filteredClassGroups: StudentReferenceData['classGroups'];
  isLoading: boolean;
  isError: boolean;
}

/**
 * High-level hook consumed by the students table/page. It keeps the component
 * dumb: give it the current filters + page and it returns the rows to render.
 *
 * Filter/page UI state (search box, current page) stays owned by the component
 * — that is transient view state, not server state.
 */
export function useStudentsTable(
  filters: StudentFilters,
  page: number,
  pageSize: number = STUDENTS_PAGE_SIZE
): UseStudentsTableResult {
  const studentsQuery = useStudents();
  const referenceQuery = useStudentReferenceData();

  const reference = referenceQuery.data ?? EMPTY_REFERENCE;
  const students = studentsQuery.data ?? [];

  const paged = useMemo(
    () =>
      filterAndPaginateStudents(
        students,
        reference.classGroups,
        reference.enrollments,
        filters,
        page,
        pageSize
      ),
    [students, reference.classGroups, reference.enrollments, filters, page, pageSize]
  );

  const filteredClassGroups = useMemo(
    () =>
      filters.departmentId
        ? reference.classGroups.filter((c) => c.departmentId === filters.departmentId)
        : reference.classGroups,
    [reference.classGroups, filters.departmentId]
  );

  return {
    paged,
    reference,
    filteredClassGroups,
    isLoading: studentsQuery.isLoading,
    isError: studentsQuery.isError,
  };
}
