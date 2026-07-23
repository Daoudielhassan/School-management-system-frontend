/**
 * Domain types for the manager self-service portal.
 *
 * Reads/writes scoped to the currently authenticated manager. `GET /api/managers/me`
 * resolves the manager entity from the JWT; every `{managerId}`-prefixed
 * endpoint below then uses that resolved `Manager.id` (not the identity
 * `userId` — the two are distinct entities, see `ManagerAccessGuard` in
 * API_REFERENCE.md §2.12).
 */
import type { SessionData } from '@/features/sessions';
import type { TeachingAssignment, TeachingAssignmentStatus } from '@/types/education';

// --- Profile ------------------------------------------------------------

export type ManagerLevel =
  | 'HEAD_OF_DEPARTMENT'
  | 'ACADEMIC_DIRECTOR'
  | 'PROGRAM_COORDINATOR'
  | 'YEAR_COORDINATOR'
  | 'QUALITY_ASSURANCE_MANAGER'
  | 'STUDENT_AFFAIRS_MANAGER';

export type ManagerStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';

/** Matches `Manager` (`GET /api/managers/me` / `/{id}` / `/user/{userId}` / `/employee/{employeeNumber}`). */
export interface ManagerProfile {
  id: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Fixed 1:1 with the manager at creation — immutable, not part of `ManagerUpdateRequest`. */
  departmentId: string;
  phone?: string;
  specialization?: string;
  bio?: string | null;
  officeLocation?: string;
  officePhone?: string;
  dateOfBirth?: string;
  hireDate?: string;
  level: ManagerLevel;
  status: ManagerStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for `PUT /api/managers/{id}` (`ManagerUpdateRequest`). Deliberately
 * narrower than `ManagerProfile` — `employeeNumber`, `departmentId`,
 * `dateOfBirth` and `hireDate` are immutable after creation, and `status`
 * has its own endpoint (`PATCH /api/managers/{id}/status?status=`, query
 * param, no body).
 */
export interface ManagerProfileUpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  level?: ManagerLevel;
  specialization?: string | null;
  officeLocation?: string | null;
  officePhone?: string | null;
  bio?: string | null;
}

/** Payload for `POST /api/managers` (`ManagerCreateRequest`) — admin-only manager provisioning. */
export interface ManagerCreatePayload {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  dateOfBirth: string;
  hireDate: string;
  phone?: string;
  level?: ManagerLevel;
  specialization?: string;
  officeLocation?: string;
  officePhone?: string;
  bio?: string | null;
}

/** Response of `POST /api/managers` — includes a one-time `temporaryPassword`, unlike the full `ManagerProfile` shape. */
export interface ManagerCreateResponse {
  id: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  temporaryPassword: string;
}

/** Payload for `POST /api/auth/change-password`. */
export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// --- Department overview -----------------------------------------------

/** Matches `ClassGroupStatus` — a cohort's lifecycle across academic year rollovers. */
export type ClassGroupStatus = 'ACTIVE' | 'GRADUATED' | 'ARCHIVED';

export interface ClassGroupLite {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  level: number;
  status: ClassGroupStatus;
}

export type EnrollmentStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'GRADUATED';

/** Matches `EnrollmentResponse` (`GET /api/class-groups/{id}/students`) — ids only, no student details. */
export interface EnrollmentLite {
  id: string;
  studentId: string;
  classGroupId: string;
  status: EnrollmentStatus;
  createdAt: string;
}

/** Payload for `POST /api/managers/{managerId}/department/repetitions`. */
export interface RepetitionPayload {
  studentId: string;
  currentClassGroupId: string;
  newClassGroupId: string;
}

/** Matches `DiplomaResponse` (`GET /api/managers/{managerId}/department/diplomas`). */
export interface DiplomaResponse {
  id: string;
  studentId: string;
  departmentId: string;
  academicYearId: string;
  issuedAt: string;
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
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

/** Matches `AttendanceResponse` scoped to the manager's department. */
export interface AttendanceResponse {
  id: string;
  studentId: string;
  sessionId: string;
  classGroupId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  updatedAt?: string;
}

export type { SessionData };

// --- Validations (attendance justifications) -----------------------------

export type ValidationDecision = 'VALIDATED' | 'REJECTED';

/** Matches `PendingAttendanceDTO` (`GET /api/manager/validations/attendances/pending`). */
export interface PendingAttendanceDTO {
  attendanceId: string;
  studentId: string;
  classGroupId: string;
  subjectId: string;
  recordedBy: string;
  studentName: string;
  classGroupName: string;
  subjectName: string;
  status: AttendanceStatus;
  justification: string | null;
  recordedByName: string;
  sessionDate: string;
  justificationSubmittedAt: string | null;
  recordedAt: string;
}

/** Payload for `POST /api/manager/validations/attendances/{attendanceId}/validate`. */
export interface AttendanceValidationPayload {
  validatedBy: string;
  decision: ValidationDecision;
  managerComment?: string;
}

/** Matches `ValidationResultDTO`. */
export interface ValidationResultDTO {
  success: boolean;
  message: string;
  entityType: string;
  newStatus: string;
  errorDetails: string | null;
  validatedAt: string;
}

/** Payload for `POST /api/manager/validations/attendances/bulk-validate`. */
export interface BulkAttendanceValidationPayload {
  attendanceIds: string[];
  validatedBy: string;
  decision: ValidationDecision;
  managerComment?: string;
}

/** Matches `BulkValidationResultDTO`. */
export interface BulkValidationResultDTO {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  successIds: string[];
  failureDetails: string[];
}

/** Matches `ValidationStatsDTO`. */
export interface ValidationStatsDTO {
  pendingAttendances: number;
  validatedAttendances: number;
  rejectedAttendances: number;
  totalValidationsToday: number;
}

// --- Teaching assignments -------------------------------------------------

export type { TeachingAssignment, TeachingAssignmentStatus };

export interface SubjectLite {
  id: string;
  name: string;
}

export interface InstructorLite {
  id: string;
  /** The identity-service user id — this is what messaging's `receiverId` expects, not `id`. */
  userId: string;
  name: string;
}

/** Payload for `POST /api/managers/{managerId}/teaching-assignments` (no `departmentId` — resolved server-side). */
export interface TeachingAssignmentCreatePayload {
  classGroupId: string;
  instructorId: string;
  subjectId: string;
  academicYearId: string;
}

export interface AcademicYearLite {
  id: string;
  code: string;
  status: string;
}

// --- Manager assignments / responsibilities / actions (read-only) --------

export type ManagerAssignmentType =
  | 'DEPARTMENT_HEAD'
  | 'CLASS_SUPERVISOR'
  | 'MODULE_SUPERVISOR'
  | 'SUBJECT_SUPERVISOR'
  | 'PROGRAM_MANAGER'
  | 'YEAR_COORDINATOR'
  | 'QUALITY_CONTROLLER';

/** Matches the `ManagerAssignment` entity (§2.12.2) — read-only from the manager's own view. */
export interface ManagerAssignment {
  id: string;
  managerId: string;
  departmentId: string;
  classGroupId: string | null;
  teachingModuleId: string | null;
  subjectId: string | null;
  academicYearId: string;
  assignedBy: string;
  revokedBy: string | null;
  assignmentType: ManagerAssignmentType;
  assignedAt: string;
  revokedAt: string | null;
  isActive: boolean;
  notes?: string | null;
}

export type ResponsibilityType =
  | 'STUDENT_ENROLLMENT'
  | 'GRADE_VALIDATION'
  | 'ATTENDANCE_MONITORING'
  | 'SCHEDULE_MANAGEMENT'
  | 'BUDGET_APPROVAL'
  | 'STAFF_EVALUATION'
  | 'REPORT_GENERATION'
  | 'EXAM_COORDINATION';

/** Matches the `ManagerResponsibility` entity (§2.12.4). */
export interface ManagerResponsibility {
  id: string;
  managerId: string;
  responsibilityType: ResponsibilityType;
  description: string;
  canApprove: boolean;
  canReject: boolean;
  canModify: boolean;
  canView: boolean;
  isActive: boolean;
  grantedAt: string;
  revokedAt: string | null;
}

export type ManagerActionType =
  | 'APPROVE_ENROLLMENT'
  | 'REJECT_ENROLLMENT'
  | 'VALIDATE_GRADE'
  | 'APPROVE_ABSENCE_JUSTIFICATION'
  | 'MODIFY_SCHEDULE'
  | 'APPROVE_BUDGET'
  | 'EVALUATE_STAFF'
  | 'GENERATE_REPORT';

export type ManagerActionStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';

/** Matches the `ManagerAction` entity (§2.12.1) — the manager's own audit trail. */
export interface ManagerAction {
  id: string;
  managerId: string;
  entityId: string;
  actionType: ManagerActionType;
  entityType: string;
  details: string | null;
  reason: string | null;
  ipAddress: string | null;
  status: ManagerActionStatus;
  actionTimestamp: string;
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

/** Payload for `POST /api/messages/send` — `senderId` is resolved server-side from the JWT. */
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
