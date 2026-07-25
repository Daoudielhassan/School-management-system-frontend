/**
 * Domain + view types for the classes feature.
 */

export interface ClassGroup {
  id: string;
  code: string;
  name: string;
  departmentId?: string;
  level: number;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
}

export interface Module {
  id: string;
  name: string;
  departmentId: string;
}

/** A student's membership in a class group (education-core `enrollments` shape). */
export interface Enrollment {
  id: string;
  studentId: string;
  classGroupId: string;
  status?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  syllabus?: string;
}

/** A student enrolled in a class (education-core `students` shape). */
export interface EnrolledStudent {
  id: string;
  userId?: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  status?: string;
  dateOfBirth?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  status: string;
  attendanceDate: string;
}

/** Matches `GET /api/users/admin/stats` (field names are "indicative" per the backend reference). */
export interface UserStats {
  totalUsers: number;
  admins: number;
  managers: number;
  instructors: number;
  students: number;
  enabled: number;
  disabled: number;
}

/** Payload for create / update of a class group. */
export interface ClassMutationPayload {
  code: string;
  name: string;
  departmentId: string | null;
  level: number;
}

/** Reference data needed by the grid, dashboard and dialogs. */
export interface ClassReferenceData {
  departments: Department[];
  modules: Module[];
  subjects: Subject[];
  enrollments: Enrollment[];
  attendanceRecords: AttendanceRecord[];
  userStats: UserStats;
}

/** Computed dashboard figures shown above the grid. */
export interface ClassDashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalModules: number;
  totalSubjects: number;
  todayAttendance: number;
  presentToday: number;
  absentToday: number;
}

export interface ClassFilters {
  search: string;
  departmentId: string;
}
