/**
 * Pure, side-effect-free student filtering + pagination.
 *
 * Extracted from the old page-level `useEffect` so it can be unit-tested and
 * reused. Given the full student list, the reference data and the active
 * filters, it returns exactly the page of rows the table should render.
 */
import { STUDENTS_PAGE_SIZE } from '../constants';
import type {
  StudentData,
  ClassGroup,
  EnrollmentData,
  StudentFilters,
  PagedStudents,
} from '../types';

/**
 * Build the set of student ids allowed by the class/department filter, or
 * `null` when no class/department filter is active (i.e. everyone passes).
 */
function buildAllowedStudentIds(
  filters: Pick<StudentFilters, 'departmentId' | 'classId'>,
  classGroups: ClassGroup[],
  enrollments: EnrollmentData[]
): Set<string> | null {
  if (filters.classId) {
    return new Set(
      enrollments.filter((e) => e.classGroupId === filters.classId).map((e) => e.studentId)
    );
  }

  if (filters.departmentId) {
    const deptClassIds = new Set(
      classGroups.filter((c) => c.departmentId === filters.departmentId).map((c) => c.id)
    );
    return new Set(
      enrollments.filter((e) => deptClassIds.has(e.classGroupId)).map((e) => e.studentId)
    );
  }

  return null;
}

function matchesSearch(student: StudentData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    student.firstName.toLowerCase().includes(q) ||
    student.lastName.toLowerCase().includes(q) ||
    student.email.toLowerCase().includes(q) ||
    student.studentNumber.toLowerCase().includes(q)
  );
}

/**
 * Filter `students` by search + department/class, then return the `page`
 * (0-based) slice of `pageSize` rows along with pagination metadata.
 */
export function filterAndPaginateStudents(
  students: StudentData[],
  classGroups: ClassGroup[],
  enrollments: EnrollmentData[],
  filters: StudentFilters,
  page: number,
  pageSize: number = STUDENTS_PAGE_SIZE
): PagedStudents {
  const allowedIds = buildAllowedStudentIds(filters, classGroups, enrollments);

  const filtered = students.filter(
    (s) => matchesSearch(s, filters.search) && (!allowedIds || allowedIds.has(s.id))
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
