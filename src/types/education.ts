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

// ─── Teaching Assignment Types ─────────────────────────────────────────────────

export type TeachingAssignmentStatus = 'ACTIVE' | 'CANCELLED';

/**
 * The contract ("who teaches what, to which class, for which year") a
 * `Session.teachingAssignmentId` points to. Introduced when `Session` lost its
 * direct `classGroupId`/`subjectId`/`instructorId`/`teachingModuleId` fields —
 * see API_REFERENCE.md §2.15/§2.19.
 */
export interface TeachingAssignment {
  id: string;
  departmentId: string;
  classGroupId: string;
  instructorId: string;
  subjectId: string;
  academicYearId: string;
  status: TeachingAssignmentStatus;
  createdAt: string;
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
