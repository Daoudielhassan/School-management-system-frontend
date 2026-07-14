/**
 * Domain + view types for the users feature.
 */
import type { RoleFilter } from './constants';

/** A user as returned by the identity service. */
export interface UserData {
  id: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: string;
  enabled: boolean;
  createdAt?: string;
}

/** Payload for `POST /api/users`. */
export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  firstname: string | null;
  lastname: string | null;
  role: string;
}

/** Payload for `PUT /api/users/:id` (password is managed separately). */
export interface UpdateUserPayload {
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  role: string;
}

/**
 * Aggregate user statistics from `GET /api/users/admin/stats`. Field names are
 * marked "indicative" in the backend reference (no fixed DTO), so this covers
 * the documented shape only.
 */
export interface UserStats {
  totalUsers: number;
  admins: number;
  managers: number;
  instructors: number;
  students: number;
  enabled: number;
  disabled: number;
}

/** Filter criteria applied client-side. */
export interface UserFilters {
  search: string;
  role: RoleFilter;
}

/** A page of filtered users plus pagination metadata. */
export interface PagedUsers {
  rows: UserData[];
  totalItems: number;
  totalPages: number;
  page: number;
}
