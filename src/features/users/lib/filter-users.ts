/**
 * Pure filtering + pagination for the users list.
 */
import { ROLE_FILTER_ALL, USERS_PAGE_SIZE } from '../constants';
import type { UserData, UserFilters, PagedUsers } from '../types';

function matchesSearch(user: UserData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    user.username.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q) ||
    (user.firstname ?? '').toLowerCase().includes(q) ||
    (user.lastname ?? '').toLowerCase().includes(q)
  );
}

export function filterAndPaginateUsers(
  users: UserData[],
  filters: UserFilters,
  page: number,
  pageSize: number = USERS_PAGE_SIZE
): PagedUsers {
  const filtered = users.filter(
    (u) =>
      (filters.role === ROLE_FILTER_ALL || u.role === filters.role) &&
      matchesSearch(u, filters.search)
  );

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = safePage * pageSize;

  return {
    rows: filtered.slice(start, start + pageSize),
    totalItems,
    totalPages,
    page: safePage,
  };
}
