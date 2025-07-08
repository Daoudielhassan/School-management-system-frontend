const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  LOGIN: `${API_URL}/api/auth/login`,
  STUDENT: {
    PROFILE: `${API_URL}/api/student/profile`,
    COURSES: `${API_URL}/api/student/courses`,
    ATTENDANCE: `${API_URL}/api/student/attendance`,
  },
  PROFESSOR: {
    COURSES: `${API_URL}/api/professor/courses`,
    STUDENTS: `${API_URL}/api/professor/students`,
  },
  INSTRUCTOR: {
    PROFILE: `${API_URL}/api/instructors/user`,
    STATS: `${API_URL}/api/instructors`,
    ATTENDANCE_STATS: `${API_URL}/api/instructors`,
    COURSES: `${API_URL}/api/instructors`,
    STUDENTS: `${API_URL}/api/instructors`,
    MESSAGES: `${API_URL}/api/instructors`,
    OPPORTUNITIES: `${API_URL}/api/instructors`,
    GRADES: `${API_URL}/api/instructors`,
  },
  SESSIONS: {
    BY_INSTRUCTOR: `${API_URL}/api/sessions/instructor`,
    UPCOMING: `${API_URL}/api/sessions/instructor`,
  },
  ATTENDANCE: {
    BY_SESSION: `${API_URL}/api/attendance/session`,
    BULK_UPDATE: `${API_URL}/api/attendance/bulk-update`,
    INITIALIZE: `${API_URL}/api/attendance/initialize`,
  },
  MESSAGES: {
    MARK_READ: `${API_URL}/api/messages`,
  },
  MANAGER: {
    DEPARTMENTS: `${API_URL}/api/manager/departments`,
    STAFF: `${API_URL}/api/manager/staff`,
  },
  ADMIN: {
    USERS: `${API_URL}/api/admin/users`,
    ROLES: `${API_URL}/api/admin/roles`,
  },
};