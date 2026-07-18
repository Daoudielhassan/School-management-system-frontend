/**
 * React Query key roots for the student portal. Namespaced under `student`
 * (singular) to stay isolated from the admin `students` (plural) CRUD feature
 * — different bounded contexts, different caches.
 */
export const STUDENT_PROFILE_QUERY_KEY = ['student', 'profile'] as const;
export const STUDENT_GRADES_QUERY_KEY = ['student', 'grades'] as const;
export const STUDENT_ATTENDANCE_QUERY_KEY = ['student', 'attendance'] as const;
export const STUDENT_ENROLLMENTS_QUERY_KEY = ['student', 'enrollments'] as const;
export const STUDENT_SCHEDULE_QUERY_KEY = ['student', 'schedule'] as const;
export const STUDENT_INSTRUCTOR_QUERY_KEY = ['student', 'instructor'] as const;
export const STUDENT_TEACHING_ASSIGNMENT_QUERY_KEY = ['student', 'teaching-assignment'] as const;
export const STUDENT_MESSAGES_QUERY_KEY = ['student', 'messages'] as const;
export const STUDENT_NOTIFICATIONS_QUERY_KEY = ['student', 'notifications'] as const;
export const STUDENT_DASHBOARD_QUERY_KEY = ['student', 'dashboard'] as const;

/** Enrollment status considered "current" when picking the schedule's class group. */
export const ACTIVE_ENROLLMENT_STATUS = 'ACTIVE';
