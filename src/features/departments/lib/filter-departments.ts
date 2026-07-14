/**
 * Pure filtering for the departments list.
 */
import type { Department, DepartmentFilters } from '../types';

export function filterDepartments(
  departments: Department[],
  filters: DepartmentFilters
): Department[] {
  const q = filters.search.toLowerCase();
  if (!q) return departments;
  return departments.filter(
    (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
  );
}
