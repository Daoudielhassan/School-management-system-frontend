// ─── Student Domain Types ────────────────────────────────────────────────────

export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt?: string;
  temporaryPassword?: string;
}

export interface EnrollmentData {
  id: string;
  studentId: string;
  classGroupId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  enrolledAt?: string;
}

export interface CreateStudentPayload {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
}
