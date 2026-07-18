/**
 * Domain types for the admin "Managers" directory (create/read/update/delete
 * manager accounts). Deliberately self-contained — not shared with
 * `src/features/manager` (the manager's own self-service portal), matching
 * how `students`/`student` stay isolated bounded contexts.
 */

export type ManagerLevel =
  | 'HEAD_OF_DEPARTMENT'
  | 'ACADEMIC_DIRECTOR'
  | 'PROGRAM_COORDINATOR'
  | 'YEAR_COORDINATOR'
  | 'QUALITY_ASSURANCE_MANAGER'
  | 'STUDENT_AFFAIRS_MANAGER';

export type ManagerStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';

/** A manager as returned by `GET /api/managers/{id}` / `/active` / `/search` etc. */
export interface ManagerData {
  id: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Fixed 1:1 with the manager at creation — immutable afterwards. */
  departmentId: string;
  phone?: string | null;
  specialization?: string | null;
  bio?: string | null;
  officeLocation?: string | null;
  officePhone?: string | null;
  dateOfBirth?: string;
  hireDate?: string;
  level: ManagerLevel;
  status: ManagerStatus;
  createdAt: string;
  updatedAt?: string;
}

/** Response of `POST /api/managers`. Includes a one-time `temporaryPassword` to display. */
export interface CreateManagerResponse {
  id: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  temporaryPassword: string;
}

/** Payload for `POST /api/managers` (`ManagerCreateRequest`) — `employeeNumber` is generated server-side, never sent. */
export interface ManagerCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  dateOfBirth: string;
  hireDate: string;
  phone?: string | null;
  level?: ManagerLevel;
  specialization?: string | null;
  officeLocation?: string | null;
  officePhone?: string | null;
  bio?: string | null;
}

/**
 * Payload for `PUT /api/managers/{id}` (`ManagerUpdateRequest`) — no
 * `employeeNumber`/`departmentId`/`dateOfBirth`/`hireDate` (immutable after
 * creation) and no `status` (its own `PATCH .../status?status=` endpoint).
 */
export interface ManagerUpdatePayload {
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

// --- Reference data -----------------------------------------------------

export interface Department {
  id: string;
  name: string;
}

// --- View models ----------------------------------------------------------

export interface ManagerFilters {
  search: string;
  departmentId: string;
}

export interface PagedManagers {
  rows: ManagerData[];
  totalItems: number;
  totalPages: number;
  page: number;
}
