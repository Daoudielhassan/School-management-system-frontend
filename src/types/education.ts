// ─── Academic Structure Types ─────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  code?: string;
  createdAt?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  level: number;
  createdAt?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ─── Instructor Types ─────────────────────────────────────────────────────────

export interface Instructor {
  id: string;
  userId: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  phoneNumber?: string;
  createdAt?: string;
  temporaryPassword?: string;
}

// ─── Attendance Types ─────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  justification?: string;
  recordedAt?: string;
}
