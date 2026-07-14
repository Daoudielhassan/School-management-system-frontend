// ─── Audit Log Domain Types ──────────────────────────────────────────────────

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'ERROR';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  username?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  httpMethod?: string;
  httpStatus?: number;
  ipAddress?: string;
  details?: string;
}

export interface AuditStats {
  total: number;
  creates: number;
  updates: number;
  deletes: number;
  errors: number;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
