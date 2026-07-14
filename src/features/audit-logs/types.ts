/**
 * Canonical types for the audit-logs feature. A single `AuditLog` shape is used
 * by both the query hooks and the table columns (the old page duplicated this
 * as two incompatible interfaces, which caused a ColumnDef type error).
 */

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string;
  httpMethod?: string;
  httpStatus?: number;
  ipAddress?: string;
  details?: string;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditLogStats {
  total: number;
  creates: number;
  updates: number;
  deletes: number;
  errors: number;
}

export interface AuditLogFilters {
  action?: string;
  resource?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
