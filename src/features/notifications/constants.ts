export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

/** `type`/`channel` are free strings server-side; these are the observed usual values (§3.3). */
export const TYPE_OPTIONS = [
  { value: 'SYSTEM', label: 'System' },
  { value: 'GRADE', label: 'Grade' },
  { value: 'ATTENDANCE', label: 'Attendance' },
  { value: 'DISCIPLINE', label: 'Discipline' },
] as const;

export const CHANNEL_OPTIONS = [
  { value: 'IN_APP', label: 'In-App' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
] as const;
