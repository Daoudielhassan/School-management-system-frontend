// ─── Session Domain Types ────────────────────────────────────────────────────

export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Session {
  id: string;
  instructorId: string;
  classGroupId: string;
  departmentId?: string;
  subjectName: string;
  roomNumber?: string;
  startsAt: string;
  endsAt: string;
  status: SessionStatus;
  notes?: string;
  createdAt?: string;
}

export interface CreateSessionPayload {
  instructorId: string;
  classGroupId: string;
  departmentId?: string;
  subjectName: string;
  roomNumber?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}
