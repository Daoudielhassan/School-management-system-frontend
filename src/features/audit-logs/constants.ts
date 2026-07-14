/**
 * Static configuration for the audit-logs feature.
 */
export const AUDIT_LOGS_QUERY_KEY = ['audit-logs'] as const;

export const AUDIT_LOG_PAGE_SIZE = 50;

/** Selectable action filters (ALL = no filter). */
export const AUDIT_ACTION_OPTIONS = [
  { value: 'ALL', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'ERROR', label: 'Error' },
  { value: 'READ', label: 'Read' },
] as const;

export const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  UPDATE: 'bg-blue-100 text-blue-800 border-blue-300',
  DELETE: 'bg-red-100 text-red-800 border-red-300',
  ERROR: 'bg-orange-100 text-orange-800 border-orange-300',
  READ: 'bg-gray-100 text-gray-700 border-gray-300',
};

export const ACTION_ICON: Record<string, string> = {
  CREATE: '✚',
  UPDATE: '✎',
  DELETE: '✖',
  ERROR: '⚠',
  READ: '⊙',
};
