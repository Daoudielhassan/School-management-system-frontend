/**
 * Domain types for the instructor (professor) self-service portal.
 *
 * Reads/writes scoped to the currently authenticated instructor. `GET
 * /api/instructors/me` resolves the instructor entity from the JWT; every
 * `{instructorId}`-prefixed endpoint below then uses that resolved
 * `Instructor.id` (not the identity `userId` — the two are distinct
 * entities, see `InstructorAccessGuard`).
 */

// --- Profile ------------------------------------------------------------

/** Matches `InstructorResponse` (`GET /api/instructors/me` / `/{id}`). */
export interface InstructorProfile {
  id: string;
  userId: string;
  code: string;
  name: string;
  email: string;
}

/** Payload for `PUT /api/instructors/{id}` (`InstructorRequest`) — `code` is required by the backend but kept read-only in the form. */
export interface InstructorProfileUpdatePayload {
  code: string;
  name: string;
  email: string;
}

/** Payload for `POST /api/auth/change-password`. */
export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// --- Teaching assignments -------------------------------------------------

export type TeachingAssignmentStatus = 'ACTIVE' | 'CANCELLED';

/** Matches `TeachingAssignmentResponse` (`GET /api/teaching-assignments?instructorId=`). */
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

export interface SubjectLite {
  id: string;
  name: string;
}

/** Matches `ClassGroupResponse` — used to resolve a class group's display name. */
export interface ClassGroupLite {
  id: string;
  code: string;
  name: string;
}

/** Matches `AcademicYearResponse` — used to resolve an academic year's display code. */
export interface AcademicYearLite {
  id: string;
  code: string;
}

// --- Sessions / schedule --------------------------------------------------

/** Matches `SessionResponse` — `Session` carries a `teachingAssignmentId`, not a direct instructor/subject/class-group id. */
export interface SessionData {
  id: string;
  managerId: string;
  departmentId: string;
  teachingAssignmentId: string;
  startsAt: string;
  endsAt: string;
  room: string | null;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

// --- Attendance ------------------------------------------------------------

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

/** Matches `AttendanceResponse`. */
export interface AttendanceResponse {
  id: string;
  studentId: string;
  sessionId: string;
  classGroupId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  updatedAt?: string;
}

/** Matches `EnrollmentResponse` (`GET /api/class-groups/{id}/students`) — ids only. */
export interface EnrollmentLite {
  id: string;
  studentId: string;
  classGroupId: string;
  status: string;
  createdAt: string;
}

/** Matches `StudentResponse` (`GET /api/students/{id}`). */
export interface StudentLite {
  id: string;
  /** The identity-service user id — this is what messaging's `receiverId` expects, not `id`. */
  userId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
}

// --- Grades ----------------------------------------------------------------

export type EvaluationType = 'EXAM' | 'QUIZ' | 'HOMEWORK' | 'PROJECT' | 'PARTICIPATION' | 'OTHER';

/** Matches `GradeResponse` (`GET /api/grades?instructorId=`). */
export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  instructorId: string;
  value: number;
  maxValue: number;
  evaluationType: EvaluationType;
  comment: string | null;
  gradedAt: string;
  createdAt: string;
}

/** Payload for `POST /api/grades` / `PUT /api/grades/{id}` (`GradeRequest`). */
export interface GradeMutationPayload {
  studentId: string;
  subjectId: string;
  instructorId: string;
  value: number;
  maxValue: number;
  evaluationType: EvaluationType;
  comment?: string;
  gradedAt?: string;
}

// --- Messages -----------------------------------------------------------

/** Matches `MessageResponse` (communication-hub-service). */
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

/** Payload for `POST /api/messages/send` — `senderId` is resolved server-side from the JWT. */
export interface SendMessagePayload {
  receiverId: string;
  subject?: string;
  content: string;
  parentMessageId?: string;
}

// --- Notifications ------------------------------------------------------

/** Matches `NotificationResponse` (communication-hub-service). */
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
