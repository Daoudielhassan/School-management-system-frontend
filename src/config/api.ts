const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
  },
  USERS: `${API_URL}/api/users`,
  STUDENTS: `${API_URL}/api/students`,
  DEPARTMENTS: `${API_URL}/api/departments`,
  CLASSES: `${API_URL}/api/classes`,
  MODULES: `${API_URL}/api/modules`,
  SUBJECTS: `${API_URL}/api/subjects`,
  SESSIONS: {
    BASE: `${API_URL}/api/sessions`,
    BY_INSTRUCTOR: `${API_URL}/api/sessions/instructor`,
    UPCOMING: `${API_URL}/api/sessions/instructor`,
  },
  ATTENDANCE: {
    BASE: `${API_URL}/api/attendance`,
    BY_SESSION: `${API_URL}/api/attendance/session`,
    BULK_UPDATE: `${API_URL}/api/attendance/bulk-update`,
    INITIALIZE: `${API_URL}/api/attendance/initialize`,
  },
  DISCIPLINE: `${API_URL}/api/admin/discipline`,
  REPORTS: `${API_URL}/api/admin/reports`,
  MESSAGES: {
    BASE: `${API_URL}/api/messages`,
    RECEIVED: `${API_URL}/api/messages/received`,
    SENT: `${API_URL}/api/messages/sent`,
    MARK_READ: `${API_URL}/api/messages`,
    STATS: `${API_URL}/api/messages/stats`,
  },
  NOTIFICATIONS: `${API_URL}/api/notifications`,
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
  MANAGER: {
    DEPARTMENTS: `${API_URL}/api/manager/departments`,
    STAFF: `${API_URL}/api/manager/staff`,
  },
  ADMIN: {
    USERS: `${API_URL}/api/admin/users`,
    ROLES: `${API_URL}/api/admin/roles`,
  },
};

// --- API helper functions ---

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = (data && data.message) || response.statusText || 'API Error';
    throw new Error(error);
  }
  return data;
}

export async function apiGet(url: string, token?: string) {
  const res = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(res);
}

export async function apiPost(url: string, data: any, token?: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function apiPut(url: string, data: any, token?: string) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function apiDelete(url: string, token?: string) {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(res);
}
