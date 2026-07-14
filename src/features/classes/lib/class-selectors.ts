/**
 * Pure selectors + computations for the classes feature. Extracted from the
 * page's inline `useEffect`/helpers so they are testable and side-effect-free.
 */
import { DEPARTMENT_FILTER_ALL, isPresentStatus, isAbsentStatus } from '../constants';
import type {
  ClassGroup,
  ClassFilters,
  ClassReferenceData,
  ClassDashboardStats,
  Module,
  Subject,
} from '../types';

/** Filter classes by name search + department. */
export function filterClasses(classes: ClassGroup[], filters: ClassFilters): ClassGroup[] {
  const q = filters.search.toLowerCase();
  return classes.filter((c) => {
    const matchesSearch = !q || c.name.toLowerCase().includes(q);
    const matchesDept =
      filters.departmentId === DEPARTMENT_FILTER_ALL ||
      c.departmentId === filters.departmentId;
    return matchesSearch && matchesDept;
  });
}

/** Modules belonging to a department. */
export function modulesByDepartment(modules: Module[], departmentId?: string): Module[] {
  return modules.filter((m) => m.department_id === departmentId);
}

/** Subjects belonging to a module. */
export function subjectsByModule(subjects: Subject[], moduleId: string): Subject[] {
  return subjects.filter((s) => s.moduleId === moduleId);
}

/**
 * Compute the dashboard figures shown above the grid. `reference.attendanceRecords`
 * is already scoped to today by the API layer (`date` query param).
 */
export function computeDashboardStats(
  classes: ClassGroup[],
  reference: ClassReferenceData
): ClassDashboardStats {
  const todayRecords = reference.attendanceRecords;

  return {
    totalClasses: classes.length,
    totalStudents: reference.userStats.students ?? 0,
    totalModules: reference.modules.length,
    totalSubjects: reference.subjects.length,
    todayAttendance: todayRecords.length,
    presentToday: todayRecords.filter((r) => isPresentStatus(r.status)).length,
    absentToday: todayRecords.filter((r) => isAbsentStatus(r.status)).length,
  };
}
