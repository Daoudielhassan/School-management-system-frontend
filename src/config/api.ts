const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
  },
  USERS: `${API_URL}/api/users`,
  STUDENTS: {
    BASE: `${API_URL}/api/students`,
    BY_ID: (id: number | string) => `${API_URL}/api/students/${id}`,
    BY_USER_ID: (userId: number | string) => `${API_URL}/api/students/user/${userId}`,
    BULK_UPLOAD: `${API_URL}/api/students/bulk-upload`,
  },
  DEPARTMENTS: `${API_URL}/api/departments`,
  CLASSES: {
    BASE: `${API_URL}/api/classes`,
    BY_ID: (id: number | string) => `${API_URL}/api/classes/${id}`,
    BY_DEPARTMENT: (departmentId: number | string) => `${API_URL}/api/classes/department/${departmentId}`,
    STUDENTS: (classeId: number | string) => `${API_URL}/api/classes/${classeId}/students`,
    ADD_STUDENT: (classeId: number | string, studentId: number | string) => `${API_URL}/api/classes/${classeId}/students/${studentId}`,
  },
  MODULES: `${API_URL}/api/modules`,
  SUBJECTS: `${API_URL}/api/subjects`,
  SESSIONS: {
    BASE: `${API_URL}/api/sessions`,
    BY_ID: (id: number | string) => `${API_URL}/api/sessions/${id}`,
    BY_INSTRUCTOR: (instructorId: number | string) => `${API_URL}/api/sessions/instructor/${instructorId}`,
    BY_INSTRUCTOR_AND_DATE: (instructorId: number | string, date: string) => `${API_URL}/api/sessions/instructor_date?instructorId=${instructorId}&sessionDate=${date}`,
    UPCOMING: (instructorId: number | string) => `${API_URL}/api/sessions/instructor/${instructorId}/upcoming`,
    BY_DEPARTMENT_AND_CLASS: (departmentId: number | string, classeId: number | string) => `${API_URL}/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`,
  },
  ATTENDANCE: {
    BASE: `${API_URL}/api/attendance`,
    BY_ID: (id: number | string) => `${API_URL}/api/attendance/${id}`,
    BY_SESSION: (sessionId: number | string) => `${API_URL}/api/attendance/session/${sessionId}`,
    BY_STUDENT: (studentId: number | string) => `${API_URL}/api/attendance/students/${studentId}`,
    BULK_UPDATE: `${API_URL}/api/attendance/bulk-update`,
    INITIALIZE: (sessionId: number | string) => `${API_URL}/api/attendance/initialize/${sessionId}`,
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
    BASE: `${API_URL}/api/instructors`,
    BY_ID: (id: number | string) => `${API_URL}/api/instructors/${id}`,
    PROFILE: `${API_URL}/api/instructors/user`,
    BY_USER_ID: (userId: number | string) => `${API_URL}/api/instructors/user/${userId}`,
    STATS: (instructorId: number | string) => `${API_URL}/api/instructors/${instructorId}/stats`,
    ATTENDANCE_STATS: (instructorId: number | string) => `${API_URL}/api/instructors/${instructorId}/attendance-stats`,
    COURSES: (instructorId: number | string) => `${API_URL}/api/instructors/${instructorId}/courses`,
    STUDENTS: (instructorId: number | string, className?: string) => 
      `${API_URL}/api/instructors/${instructorId}/students${className ? `?className=${className}` : ''}`,
    MESSAGES: (instructorId: number | string) => `${API_URL}/api/instructors/${instructorId}/messages`,
    OPPORTUNITIES: (instructorId: number | string) => `${API_URL}/api/instructors/${instructorId}/opportunities`,
    GRADES: (instructorId: number | string) => `${API_URL}/api/instructors/${instructorId}/grades`,
  },
  MANAGER: {
    BASE: `${API_URL}/api/managers`,
    BY_ID: (id: number | string) => `${API_URL}/api/managers/${id}`,
    BY_USER_ID: (userId: number | string) => `${API_URL}/api/managers/user/${userId}`,
    DEPARTMENTS: (managerId: number | string) => `${API_URL}/api/managers/${managerId}/department/classes`,
    SESSIONS: (managerId: number | string) => `${API_URL}/api/managers/${managerId}/department/sessions`,
    ATTENDANCE: (managerId: number | string) => `${API_URL}/api/managers/${managerId}/department/attendance`,
    UPDATE_ATTENDANCE: (managerId: number | string, attendanceId: number | string) => `${API_URL}/api/managers/${managerId}/attendance/${attendanceId}/status`,
  },
  ADMIN: {
    USERS: `${API_URL}/api/admin/users`,
    ROLES: `${API_URL}/api/admin/roles`,
    REPORTS: `${API_URL}/api/admin/reports`,
    DISCIPLINE: `${API_URL}/api/admin/discipline`,
  },
};

// --- API helper functions ---

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  let data;
  
  try {
    if (response.status === 204) {
      data = null;
    } else if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (parseError) {
    console.error('Error parsing response:', parseError);
    data = await response.text();
  }

  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });
    
    let errorMessage = 'API Error';
    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    }
    
    throw new Error(`${response.status}: ${errorMessage}`);
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
