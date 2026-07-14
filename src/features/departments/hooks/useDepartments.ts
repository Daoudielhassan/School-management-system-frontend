/**
 * Read-side hooks for the departments feature.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchDepartments, fetchClassesByDepartment } from '../api/departments.api';
import { filterDepartments } from '../lib/filter-departments';
import { DEPARTMENTS_QUERY_KEY, DEPARTMENT_CLASSES_QUERY_KEY } from '../constants';
import type { Department, DepartmentClass, DepartmentFilters } from '../types';

/** Fetch all departments. */
export function useDepartments() {
  const { token } = useAuth();

  return useQuery<Department[]>({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: () => fetchDepartments(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** Fetch the classes of one department (only when a department is selected). */
export function useDepartmentClasses(departmentId: string | null) {
  const { token } = useAuth();

  return useQuery<DepartmentClass[]>({
    queryKey: [...DEPARTMENT_CLASSES_QUERY_KEY, departmentId],
    queryFn: () => fetchClassesByDepartment(departmentId as string, token ?? undefined),
    enabled: !!token && !!departmentId,
    staleTime: 60_000,
  });
}

export interface UseDepartmentsScreenResult {
  departments: Department[];
  filtered: Department[];
  isLoading: boolean;
  isError: boolean;
}

/** Compose the departments query with the client-side search filter. */
export function useDepartmentsScreen(filters: DepartmentFilters): UseDepartmentsScreenResult {
  const { data, isLoading, isError } = useDepartments();
  const departments = data ?? [];

  const filtered = useMemo(
    () => filterDepartments(departments, filters),
    [departments, filters]
  );

  return { departments, filtered, isLoading, isError };
}
