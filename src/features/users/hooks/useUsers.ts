/**
 * Read-side hooks for the users feature.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchUsers, fetchUserStats } from '../api/users.api';
import { filterAndPaginateUsers } from '../lib/filter-users';
import { USERS_QUERY_KEY, USERS_PAGE_SIZE } from '../constants';
import type { UserData, UserStats, UserFilters, PagedUsers } from '../types';

/** Fetch the full users list. */
export function useUsers() {
  const { token } = useAuth();

  return useQuery<UserData[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => fetchUsers(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** Fetch aggregate user statistics (used by the reports dashboard). */
export function useUserStats() {
  const { token } = useAuth();

  return useQuery<UserStats>({
    queryKey: [...USERS_QUERY_KEY, 'stats'],
    queryFn: () => fetchUserStats(token ?? undefined),
    enabled: !!token,
    staleTime: 120_000,
  });
}

export interface UseUsersTableResult {
  paged: PagedUsers;
  isLoading: boolean;
  isError: boolean;
}

/** Compose the users query with client-side filters + pagination. */
export function useUsersTable(
  filters: UserFilters,
  page: number,
  pageSize: number = USERS_PAGE_SIZE
): UseUsersTableResult {
  const { data, isLoading, isError } = useUsers();
  const users = data ?? [];

  const paged = useMemo(
    () => filterAndPaginateUsers(users, filters, page, pageSize),
    [users, filters, page, pageSize]
  );

  return { paged, isLoading, isError };
}
