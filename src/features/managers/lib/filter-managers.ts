/**
 * Pure, side-effect-free manager filtering + pagination — mirrors
 * `features/students/lib/filter-students.ts`.
 */
import { MANAGERS_PAGE_SIZE } from '../constants';
import type { ManagerData, ManagerFilters, PagedManagers } from '../types';

function matchesSearch(manager: ManagerData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    manager.firstName.toLowerCase().includes(q) ||
    manager.lastName.toLowerCase().includes(q) ||
    manager.email.toLowerCase().includes(q) ||
    manager.employeeNumber.toLowerCase().includes(q)
  );
}

export function filterAndPaginateManagers(
  managers: ManagerData[],
  filters: ManagerFilters,
  page: number,
  pageSize: number = MANAGERS_PAGE_SIZE
): PagedManagers {
  const filtered = managers.filter(
    (m) => matchesSearch(m, filters.search) && (!filters.departmentId || m.departmentId === filters.departmentId)
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
