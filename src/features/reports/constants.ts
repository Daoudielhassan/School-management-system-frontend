export const REPORTS_QUERY_KEY = ['reports'] as const;

export const REPORT_KIND_OPTIONS = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'grades', label: 'Grades' },
] as const;

export const ATTENDANCE_SCOPE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'class-group', label: 'Class' },
] as const;

export const GRADE_SCOPE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'subject', label: 'Subject' },
] as const;

export const ATTENDANCE_CHART_COLORS: Record<string, string> = {
  Present: '#10B981',
  Absent: '#EF4444',
  Late: '#F59E0B',
  Excused: '#3B82F6',
};
