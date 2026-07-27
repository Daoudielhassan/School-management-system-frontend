/**
 * React Query key roots for the manager portal. Namespaced under `manager`
 * to stay isolated from every other feature's cache.
 */
export const MANAGER_PROFILE_QUERY_KEY = ['manager', 'profile'] as const;
export const MANAGER_DEPARTMENT_CLASS_GROUPS_QUERY_KEY = ['manager', 'department', 'class-groups'] as const;
export const MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY = ['manager', 'department', 'sessions'] as const;
export const MANAGER_DEPARTMENT_ATTENDANCE_QUERY_KEY = ['manager', 'department', 'attendance'] as const;
export const MANAGER_DEPARTMENT_DIPLOMAS_QUERY_KEY = ['manager', 'department', 'diplomas'] as const;
export const MANAGER_PENDING_VALIDATIONS_QUERY_KEY = ['manager', 'validations', 'pending'] as const;
export const MANAGER_VALIDATION_STATS_QUERY_KEY = ['manager', 'validations', 'stats'] as const;
export const MANAGER_TEACHING_ASSIGNMENTS_QUERY_KEY = ['manager', 'teaching-assignments'] as const;
export const MANAGER_ASSIGNMENTS_QUERY_KEY = ['manager', 'assignments'] as const;
export const MANAGER_RESPONSIBILITIES_QUERY_KEY = ['manager', 'responsibilities'] as const;
export const MANAGER_ACTIONS_QUERY_KEY = ['manager', 'actions'] as const;
export const MANAGER_MESSAGES_QUERY_KEY = ['manager', 'messages'] as const;
export const MANAGER_NOTIFICATIONS_QUERY_KEY = ['manager', 'notifications'] as const;
export const MANAGER_DASHBOARD_QUERY_KEY = ['manager', 'dashboard'] as const;
export const MANAGER_SUBJECTS_QUERY_KEY = ['manager', 'subjects'] as const;
export const MANAGER_MODULES_QUERY_KEY = ['manager', 'modules'] as const;
export const MANAGER_MODULE_SUBJECTS_QUERY_KEY = ['manager', 'module-subjects'] as const;
export const MANAGER_INSTRUCTORS_QUERY_KEY = ['manager', 'instructors'] as const;
export const MANAGER_ACADEMIC_YEARS_QUERY_KEY = ['manager', 'academic-years'] as const;

export const MANAGER_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'HEAD_OF_DEPARTMENT', label: 'Chef de département' },
  { value: 'ACADEMIC_DIRECTOR', label: 'Directeur académique' },
  { value: 'PROGRAM_COORDINATOR', label: 'Coordinateur de programme' },
  { value: 'YEAR_COORDINATOR', label: 'Coordinateur d’année' },
  { value: 'QUALITY_ASSURANCE_MANAGER', label: 'Responsable qualité' },
  { value: 'STUDENT_AFFAIRS_MANAGER', label: 'Responsable vie étudiante' },
];
