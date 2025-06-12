export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  MANAGER: {
    DEPARTMENTS: `${API_URL}/api/manager/departments`,
    STAFF: `${API_URL}/api/manager/staff`,
  },
  ADMIN: {
    USERS: `${API_URL}/api/admin/users`,
    ROLES: `${API_URL}/api/admin/roles`,
  },
};