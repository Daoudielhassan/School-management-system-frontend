// ============================================
// API GATEWAY CONFIGURATION FOR MICROSERVICES
// ============================================

const USE_API_GATEWAY = process.env.NEXT_PUBLIC_USE_API_GATEWAY !== 'false';
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:9000';

// Fallback to individual services (for development/testing)
const SERVICE_URLS = {
  IDENTITY: process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:8084',
  STUDENT: process.env.NEXT_PUBLIC_STUDENT_SERVICE_URL || 'http://localhost:8086',
  ACADEMIC_STRUCTURE: process.env.NEXT_PUBLIC_ACADEMIC_STRUCTURE_URL || 'http://localhost:8087',
  INSTRUCTOR: process.env.NEXT_PUBLIC_INSTRUCTOR_SERVICE_URL || 'http://localhost:8088',
  ATTENDANCE: process.env.NEXT_PUBLIC_ATTENDANCE_SERVICE_URL || 'http://localhost:8090',
  MESSAGING: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_URL || 'http://localhost:8091',
  NOTIFICATION: process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:8092',
  REPORT: process.env.NEXT_PUBLIC_REPORT_SERVICE_URL || 'http://localhost:8093',
  ADMIN: process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:8094',
  MANAGER: process.env.NEXT_PUBLIC_MANAGER_SERVICE_URL || 'http://localhost:8095',
};

// Base URL selection
const getBaseURL = (serviceName?: keyof typeof SERVICE_URLS) => {
  if (USE_API_GATEWAY || !serviceName) {
    return API_GATEWAY_URL;
  }
  return SERVICE_URLS[serviceName] || API_GATEWAY_URL;
};

// ============================================
// API ENDPOINTS (Updated for Microservices)
// ============================================

export const API_ENDPOINTS = {
  // ===== IDENTITY SERVICE =====
  AUTH: {
    LOGIN: `${getBaseURL()}/api/auth/login`,
    LOGOUT: `${getBaseURL()}/api/auth/logout`,
    REFRESH: `${getBaseURL()}/api/auth/refresh`,
  },

  USERS: {
    BASE: `${getBaseURL()}/api/users`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/users/${id}`,
    STATS: `${getBaseURL()}/api/users/admin/stats`,
  },

  // ===== ACADEMIC YEAR SERVICE =====
  ACADEMIC_YEARS: {
    BASE: `${getBaseURL()}/api/academic-years`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/academic-years/${id}`,
    CURRENT: `${getBaseURL()}/api/academic-years/current`,
    SET_ACTIVE: (id: number | string) => `${getBaseURL()}/api/academic-years/${id}/active`,
  },

  SEMESTERS: {
    BASE: `${getBaseURL()}/api/semesters`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/semesters/${id}`,
    BY_ACADEMIC_YEAR: (yearId: number | string) =>
      `${getBaseURL()}/api/semesters/academic-year/${yearId}`,
  },

  // ===== ACADEMIC STRUCTURE SERVICE =====
  DEPARTMENTS: {
    BASE: `${getBaseURL()}/api/departments`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/departments/${id}`,
  },

  // NOTE: Microservices use 'class-groups' instead of 'classes'
  CLASSES: {
    BASE: `${getBaseURL()}/api/class-groups`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/class-groups/${id}`,
    BY_DEPARTMENT: (departmentId: number | string) =>
      `${getBaseURL()}/api/class-groups/department/${departmentId}`,
    STUDENTS: (classeId: number | string) =>
      `${getBaseURL()}/api/class-groups/${classeId}/students`,
    ADD_STUDENT: (classeId: number | string, studentId: number | string) =>
      `${getBaseURL()}/api/class-groups/${classeId}/students/${studentId}`,
  },

  MODULES: {
    BASE: `${getBaseURL()}/api/modules`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/modules/${id}`,
  },

  SUBJECTS: {
    BASE: `${getBaseURL()}/api/subjects`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/subjects/${id}`,
  },

  SUBJECT_OFFERINGS: {
    BASE: `${getBaseURL()}/api/subject-offerings`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/subject-offerings/${id}`,
  },

  // ===== STUDENT SERVICE =====
  STUDENTS: {
    BASE: `${getBaseURL()}/api/students`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/students/${id}`,
    BY_USER_ID: (userId: number | string) =>
      `${getBaseURL()}/api/students/user/${userId}`,
    BULK_UPLOAD: `${getBaseURL()}/api/students/bulk-upload`,
  },

  ENROLLMENTS: {
    BASE: `${getBaseURL()}/api/enrollments`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/enrollments/${id}`,
    BY_STUDENT: (studentId: number | string) =>
      `${getBaseURL()}/api/enrollments/student/${studentId}`,
  },

  // ===== INSTRUCTOR SERVICE =====
  INSTRUCTORS: {
    BASE: `${getBaseURL()}/api/instructors`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/instructors/${id}`,
    PROFILE: `${getBaseURL()}/api/instructors/user`,
    BY_USER_ID: (userId: number | string) =>
      `${getBaseURL()}/api/instructors/user/${userId}`,
    STATS: (instructorId: number | string) =>
      `${getBaseURL()}/api/instructors/${instructorId}/stats`,
    ATTENDANCE_STATS: (instructorId: number | string) =>
      `${getBaseURL()}/api/instructors/${instructorId}/attendance-stats`,
    COURSES: (instructorId: number | string) =>
      `${getBaseURL()}/api/instructors/${instructorId}/courses`,
    STUDENTS: (instructorId: number | string, className?: string) =>
      `${getBaseURL()}/api/instructors/${instructorId}/students${className ? `?className=${className}` : ''}`,
    MESSAGES: (instructorId: number | string) =>
      `${getBaseURL()}/api/instructors/${instructorId}/messages`,
    OPPORTUNITIES: (instructorId: number | string) =>
      `${getBaseURL()}/api/instructors/${instructorId}/opportunities`,
    GRADES: (instructorId: number | string) =>
      `${getBaseURL()}/api/instructors/${instructorId}/grades`,
  },

  // ===== ATTENDANCE SERVICE =====
  ATTENDANCE: {
    BASE: `${getBaseURL()}/api/attendance`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/attendance/${id}`,
    BY_SESSION: (sessionId: number | string) =>
      `${getBaseURL()}/api/attendance/session/${sessionId}`,
    BY_STUDENT: (studentId: number | string) =>
      `${getBaseURL()}/api/attendance/students/${studentId}`,
    BULK_UPDATE: `${getBaseURL()}/api/attendance/bulk-update`,
    INITIALIZE: (sessionId: number | string) =>
      `${getBaseURL()}/api/attendance/initialize/${sessionId}`,
  },

  // ===== MESSAGING SERVICE =====
  MESSAGES: {
    BASE: `${getBaseURL()}/api/messages`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/messages/${id}`,
    RECEIVED: `${getBaseURL()}/api/messages/received`,
    SENT: `${getBaseURL()}/api/messages/sent`,
    MARK_READ: `${getBaseURL()}/api/messages`,
    STATS: (userId: number | string) => `${getBaseURL()}/api/messages/stats/${userId}`,
  },

  // ===== NOTIFICATION SERVICE =====
  NOTIFICATIONS: {
    BASE: `${getBaseURL()}/api/notifications`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/notifications/${id}`,
    UNREAD: `${getBaseURL()}/api/notifications/unread`,
    MARK_READ: (id: number | string) =>
      `${getBaseURL()}/api/notifications/${id}/read`,
  },

  // ===== REPORT SERVICE =====
  REPORTS: {
    BASE: `${getBaseURL()}/api/reports`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/reports/${id}`,
    GENERATE: `${getBaseURL()}/api/reports/generate`,
  },

  // ===== ADMIN SERVICE =====
  ADMIN: {
    BASE: `${getBaseURL()}/api/admin`,
    DASHBOARD_STATS: `${getBaseURL()}/api/admin/stats`,
    USERS: `${getBaseURL()}/api/admin/users`,
    ROLES: `${getBaseURL()}/api/admin/roles`,
    DISCIPLINE: `${getBaseURL()}/api/admin/discipline`,
  },

  // ===== MANAGER SERVICE =====
  MANAGERS: {
    BASE: `${getBaseURL()}/api/managers`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/managers/${id}`,
    BY_USER_ID: (userId: number | string) =>
      `${getBaseURL()}/api/managers/user/${userId}`,
    DEPARTMENTS: (managerId: number | string) =>
      `${getBaseURL()}/api/managers/${managerId}/department/classes`,
    SESSIONS: (managerId: number | string) =>
      `${getBaseURL()}/api/managers/${managerId}/department/sessions`,
    ATTENDANCE: (managerId: number | string) =>
      `${getBaseURL()}/api/managers/${managerId}/department/attendance`,
    UPDATE_ATTENDANCE: (managerId: number | string, attendanceId: number | string) =>
      `${getBaseURL()}/api/managers/${managerId}/attendance/${attendanceId}/status`,
  },

  VALIDATIONS: {
    BASE: `${getBaseURL()}/api/validations`,
    ATTENDANCE: `${getBaseURL()}/api/validations/attendance`,
  },

  // ===== LEGACY/COMPATIBILITY =====
  // Keep these for backward compatibility during migration
  STUDENT: {
    PROFILE: `${getBaseURL()}/api/student/profile`,
    COURSES: `${getBaseURL()}/api/student/courses`,
    ATTENDANCE: `${getBaseURL()}/api/student/attendance`,
  },
  PROFESSOR: {
    COURSES: `${getBaseURL()}/api/professor/courses`,
    STUDENTS: `${getBaseURL()}/api/professor/students`,
  },
  // ===== SESSION SERVICE (Academic Structure) =====
  SESSIONS: {
    BASE: `${getBaseURL()}/api/sessions`,
    BY_ID: (id: number | string) => `${getBaseURL()}/api/sessions/${id}`,
    BY_INSTRUCTOR: (instructorId: number | string) =>
      `${getBaseURL()}/api/sessions/instructor/${instructorId}`,
    BY_INSTRUCTOR_AND_DATE: (instructorId: number | string, date: string) =>
      `${getBaseURL()}/api/sessions/instructor_date?instructorId=${instructorId}&sessionDate=${date}`,
    UPCOMING: (instructorId: number | string) =>
      `${getBaseURL()}/api/sessions/instructor/${instructorId}/upcoming`,
    // Weekly schedules (with caching support)
    BY_CLASSGROUP_WEEK: (classGroupId: number | string) =>
      `${getBaseURL()}/api/sessions/classgroup/${classGroupId}/week`,
    BY_CLASSGROUP_WEEK_GROUPED: (classGroupId: number | string) =>
      `${getBaseURL()}/api/sessions/classgroup/${classGroupId}/week/grouped`,
    BY_DEPARTMENT_AND_CLASS: (departmentId: number | string, classeId: number | string) =>
      `${getBaseURL()}/api/sessions/filter?departmentId=${departmentId}&classeId=${classeId}`,
  },
  DISCIPLINE: `${getBaseURL()}/api/admin/discipline`,
};

// ============================================
// RETRY & RESILIENCE CONFIGURATION
// ============================================

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  retryableStatuses: [500, 502, 503, 504], // Server errors
};

const ENABLE_RETRY = process.env.NEXT_PUBLIC_ENABLE_SERVICE_RETRY === 'true';

// Exponential backoff delay
const getRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000);
};

// ============================================
// ENHANCED API HELPERS WITH RETRY LOGIC
// ============================================

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
      data: data,
      url: response.url
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

    const error = new Error(`${response.status}: ${errorMessage}`) as any;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Retry wrapper
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if not a retryable status
      if (error.status && !config.retryableStatuses.includes(error.status)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt, config.retryDelay);
      if (process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function apiGet(url: string, token?: string, enableRetry: boolean = ENABLE_RETRY) {
  const fetchFn = async () => {
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(res);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiPost(url: string, data: any, token?: string, enableRetry: boolean = false) {
  const fetchFn = async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiPut(url: string, data: any, token?: string, enableRetry: boolean = false) {
  const fetchFn = async () => {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiPatch(url: string, data: any, token?: string, enableRetry: boolean = false) {
  const fetchFn = async () => {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

export async function apiDelete(url: string, token?: string, enableRetry: boolean = false) {
  const fetchFn = async () => {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(res);
  };

  return enableRetry ? withRetry(fetchFn) : fetchFn();
}

// ============================================
// HEALTH CHECK UTILITIES
// ============================================

export async function checkServiceHealth(serviceUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${serviceUrl}/actuator/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkGatewayHealth(): Promise<boolean> {
  return checkServiceHealth(API_GATEWAY_URL);
}

// Export configuration
export const API_CONFIG = {
  GATEWAY_URL: API_GATEWAY_URL,
  USE_GATEWAY: USE_API_GATEWAY,
  SERVICE_URLS,
  ENABLE_RETRY,
};
