/**
 * React Query key roots for the instructor (professor) portal. Namespaced
 * under `instructor` to stay isolated from every other feature's cache.
 */
export const INSTRUCTOR_PROFILE_QUERY_KEY = ['instructor', 'profile'] as const;
export const INSTRUCTOR_TEACHING_ASSIGNMENTS_QUERY_KEY = ['instructor', 'teaching-assignments'] as const;
export const INSTRUCTOR_SESSIONS_QUERY_KEY = ['instructor', 'sessions'] as const;
export const INSTRUCTOR_UPCOMING_SESSIONS_QUERY_KEY = ['instructor', 'sessions', 'upcoming'] as const;
export const INSTRUCTOR_SESSION_ATTENDANCE_QUERY_KEY = ['instructor', 'session-attendance'] as const;
export const INSTRUCTOR_GRADES_QUERY_KEY = ['instructor', 'grades'] as const;
export const INSTRUCTOR_SUBJECTS_QUERY_KEY = ['instructor', 'subjects'] as const;
export const INSTRUCTOR_CLASS_STUDENTS_QUERY_KEY = ['instructor', 'class-students'] as const;
export const INSTRUCTOR_MESSAGES_QUERY_KEY = ['instructor', 'messages'] as const;
export const INSTRUCTOR_NOTIFICATIONS_QUERY_KEY = ['instructor', 'notifications'] as const;

/** `EvaluationType` enum. */
export const EVALUATION_TYPES = ['EXAM', 'QUIZ', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER'] as const;

export const EVALUATION_TYPE_OPTIONS = EVALUATION_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase(),
}));
