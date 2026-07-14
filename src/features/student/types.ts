/**
 * Domain types for the student self-service portal.
 *
 * All data here is scoped to the currently authenticated student — every read
 * goes through a `/me` endpoint resolved server-side from the JWT, and every
 * write that still needs an id (messages, notifications) takes it from
 * `useAuth().userId`, never from another user. See `../api/*.api.ts` for the
 * enforcement.
 */
import type { SessionData } from '@/features/sessions';

// --- Profile ------------------------------------------------------------

/** Matches `StudentResponse` (`GET /api/students/me`). */
export interface StudentProfile {
  id: string;
  userId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
}

/** Payload for `PUT /api/students/{id}` (`StudentRequest`). */
export interface StudentProfileUpdatePayload {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

/** Payload for `POST /api/auth/change-password`. */
export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// --- Grades ---------------------------------------------------------------

/** Matches `GradeResponse` (`GET /api/grades/me`) — teacher comment included. */
export interface GradeResponse {
  id: string;
  studentId: string;
  subjectId: string;
  instructorId: string;
  value: number;
  maxValue: number;
  evaluationType: string;
  comment: string | null;
  gradedAt: string;
  createdAt: string;
}

/** Matches `GradeReportResponse` (`GET /api/reports/grades/me`). */
export interface GradeSummary {
  id: string;
  scope: string;
  count: number;
  averagePercent: number;
  minPercent: number;
  maxPercent: number;
  bySubject?: { subjectId: string; count: number; averagePercent: number }[];
}

// --- Attendance -------------------------------------------------------------

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

/** Status of a self-service justification submitted via `POST /attendance/{id}/justify`. */
export type JustificationStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Matches `AttendanceResponse` (`GET /api/attendance/me`). `justificationStatus`
 * / `justificationReason` are part of the self-service justify contract and are
 * not yet reflected in API_REFERENCE_backend.md's `AttendanceResponse` sample.
 */
export interface AttendanceResponse {
  id: string;
  studentId: string;
  sessionId: string;
  classGroupId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  justificationStatus: JustificationStatus;
  justificationReason?: string | null;
  updatedAt?: string;
}

/** Payload for `POST /api/attendance/{id}/justify`. */
export interface JustifyAttendancePayload {
  reason: string;
}

/** Matches `AttendanceReportResponse` (`GET /api/reports/attendance/me`). */
export interface AttendanceSummary {
  id: string;
  scope: string;
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRatePercent: number;
}

// --- Schedule ---------------------------------------------------------------

/** Matches `EnrollmentResponse` returned by `GET /api/enrollments?studentId=...`. */
export interface EnrollmentData {
  id: string;
  studentId: string;
  classGroupId: string;
  status: string;
}

/** A week of sessions keyed by ISO date (`GET .../week/grouped` response shape). */
export type WeekSchedule = Record<string, SessionData[]>;

/** Matches `InstructorResponse` (`GET /api/instructors/{id}`) — `name`, not first/last. */
export interface InstructorLite {
  id: string;
  userId: string;
  code: string;
  name: string;
  email: string;
}

// --- Messages -----------------------------------------------------------

/** Matches `MessageResponse` (communication-hub-service §3.2). */
export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  parentMessageId: string | null;
  subject: string | null;
  content: string;
  read: boolean;
  starred: boolean;
  archived: boolean;
  createdAt: string;
}

/**
 * Payload for `POST /api/messages/send`. No `senderId` — the self-service
 * contract resolves the sender from the JWT server-side.
 */
export interface SendMessagePayload {
  receiverId: string;
  subject?: string;
  content: string;
  parentMessageId?: string;
}

// --- Notifications ------------------------------------------------------

/** Matches `NotificationResponse` (communication-hub-service §3.3). */
export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  status: string;
  createdAt: string;
  readAt: string | null;
}
