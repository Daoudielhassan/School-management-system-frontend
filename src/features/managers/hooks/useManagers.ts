/**
 * Read-side hooks for the managers feature.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchManagers, fetchManagerDepartments } from '../api/managers.api';
import { filterAndPaginateManagers } from '../lib/filter-managers';
import { MANAGERS_QUERY_KEY, MANAGER_REFERENCE_QUERY_KEY, MANAGERS_PAGE_SIZE } from '../constants';
import type { ManagerData, Department, ManagerFilters, PagedManagers } from '../types';

/** `GET /api/managers/active`. */
export function useManagers() {
  const { token } = useAuth();

  return useQuery<ManagerData[]>({
    queryKey: MANAGERS_QUERY_KEY,
    queryFn: () => fetchManagers(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** `GET /api/departments` — used for the create-form selector and the filter bar. */
export function useManagerDepartments() {
  const { token } = useAuth();

  return useQuery<Department[]>({
    queryKey: MANAGER_REFERENCE_QUERY_KEY,
    queryFn: () => fetchManagerDepartments(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

export interface UseManagersTableResult {
  paged: PagedManagers;
  departments: Department[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * High-level hook consumed by the managers table/page. It keeps the component
 * dumb: give it the current filters + page and it returns the rows to render.
 */
export function useManagersTable(
  filters: ManagerFilters,
  page: number,
  pageSize: number = MANAGERS_PAGE_SIZE
): UseManagersTableResult {
  const managersQuery = useManagers();
  const departmentsQuery = useManagerDepartments();

  const managers = managersQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];

  const paged = useMemo(
    () => filterAndPaginateManagers(managers, filters, page, pageSize),
    [managers, filters, page, pageSize]
  );

  return {
    paged,
    departments,
    isLoading: managersQuery.isLoading,
    isError: managersQuery.isError,
  };
}
