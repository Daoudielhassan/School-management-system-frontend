import {
  IDENTITY_BASE as _IDENTITY_BASE,
  EDUCATION_CORE_BASE as _EDUCATION_CORE_BASE,
  COMMUNICATION_HUB_BASE as _COMMUNICATION_HUB_BASE,
} from './api-base';

export const IDENTITY_BASE = _IDENTITY_BASE;
export const EDUCATION_CORE_BASE = _EDUCATION_CORE_BASE;
export const COMMUNICATION_HUB_BASE = _COMMUNICATION_HUB_BASE;

export const API_ENDPOINTS = {
  HEALTH: {
    EDUCATION_CORE: `${EDUCATION_CORE_BASE}/api/education-core/health`,
  },

  AUTH: {
    LOGIN: `${IDENTITY_BASE}/api/auth/login`,
    REGISTER: `${IDENTITY_BASE}/api/auth/register`,
    VALIDATE: `${IDENTITY_BASE}/api/auth/validate`,
    LOGOUT: `${IDENTITY_BASE}/api/auth/logout`,
    REFRESH: `${IDENTITY_BASE}/api/auth/refresh`,
    CHANGE_PASSWORD: `${IDENTITY_BASE}/api/auth/change-password`,
  },

  USERS: {
    BASE: `${IDENTITY_BASE}/api/users`,
    BY_ID: (id: string) => `${IDENTITY_BASE}/api/users/${id}`,
    BY_USERNAME: (username: string) => `${IDENTITY_BASE}/api/users/username/${username}`,
    BY_EMAIL: (email: string) => `${IDENTITY_BASE}/api/users/email/${email}`,
    BY_ROLE: (role: string) => `${IDENTITY_BASE}/api/users/role/${role}`,
    ENABLE: (id: string) => `${IDENTITY_BASE}/api/users/${id}/enable`,
    DISABLE: (id: string) => `${IDENTITY_BASE}/api/users/${id}/disable`,
    CHANGE_PASSWORD: (id: string) => `${IDENTITY_BASE}/api/users/${id}/change-password`,
    STATS: `${IDENTITY_BASE}/api/users/admin/stats`,
  },

  ACADEMIC_YEARS: {
    BASE: `${EDUCATION_CORE_BASE}/api/academic-years`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/academic-years/${id}`,
    ADD_SEMESTER: (id: string) => `${EDUCATION_CORE_BASE}/api/academic-years/${id}/semesters`,
    // Closure phase (Admin-only): promotes/graduates every ACTIVE cohort and diplomas level-3 students.
    ROLLOVER: `${EDUCATION_CORE_BASE}/api/academic-years/rollover`,
  },

  DEPARTMENTS: {
    BASE: `${EDUCATION_CORE_BASE}/api/departments`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/departments/${id}`,
  },

  CLASSES: {
    BASE: `${EDUCATION_CORE_BASE}/api/class-groups`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/class-groups/${id}`,
    BY_DEPARTMENT: (departmentId: string) => `${EDUCATION_CORE_BASE}/api/class-groups/department/${departmentId}`,
    STUDENTS: (classGroupId: string) => `${EDUCATION_CORE_BASE}/api/class-groups/${classGroupId}/students`,
    ADD_STUDENT: (classGroupId: string, studentId: string) =>
      `${EDUCATION_CORE_BASE}/api/class-groups/${classGroupId}/students/${studentId}`,
  },

  MODULES: {
    BASE: `${EDUCATION_CORE_BASE}/api/modules`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/modules/${id}`,
    // departmentId + level narrow the module choices to a class group's filière/niveau.
    FILTER: (params?: { departmentId?: string; level?: number }) => {
      const query = new URLSearchParams();
      if (params?.departmentId) query.set('departmentId', params.departmentId);
      if (params?.level != null) query.set('level', String(params.level));
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/modules${qs ? `?${qs}` : ''}`;
    },
  },

  SUBJECTS: {
    BASE: `${EDUCATION_CORE_BASE}/api/subjects`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/subjects/${id}`,
    // moduleId narrows the subject choices to a single teaching module.
    FILTER: (params?: { moduleId?: string }) => {
      const query = new URLSearchParams();
      if (params?.moduleId) query.set('moduleId', params.moduleId);
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/subjects${qs ? `?${qs}` : ''}`;
    },
  },

  INSTRUCTORS: {
    BASE: `${EDUCATION_CORE_BASE}/api/instructors`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/instructors/${id}`,
    BY_USER_ID: (userId: string) => `${EDUCATION_CORE_BASE}/api/instructors/user/${userId}`,
    ME: `${EDUCATION_CORE_BASE}/api/instructors/me`,
    STATS: (instructorId: string) => `${EDUCATION_CORE_BASE}/api/instructors/${instructorId}/stats`,
    ATTENDANCE_STATS: (instructorId: string) =>
      `${EDUCATION_CORE_BASE}/api/instructors/${instructorId}/attendance-stats`,
    BULK_UPLOAD: `${EDUCATION_CORE_BASE}/api/instructors/bulk-upload`,
  },

  STUDENTS: {
    BASE: `${EDUCATION_CORE_BASE}/api/students`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/students/${id}`,
    BY_USER_ID: (userId: string) => `${EDUCATION_CORE_BASE}/api/students/user/${userId}`,
    ME: `${EDUCATION_CORE_BASE}/api/students/me`,
    BULK_UPLOAD: `${EDUCATION_CORE_BASE}/api/students/bulk-upload`,
  },

  ENROLLMENTS: {
    BASE: `${EDUCATION_CORE_BASE}/api/enrollments`,
    BY_STUDENT: (studentId: string) => `${EDUCATION_CORE_BASE}/api/enrollments?studentId=${studentId}`,
    FILTER: (params?: { studentId?: string }) => {
      const query = new URLSearchParams();
      if (params?.studentId) query.set("studentId", params.studentId);
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/enrollments${qs ? `?${qs}` : ""}`;
    },
  },

  ATTENDANCE: {
    BASE: `${EDUCATION_CORE_BASE}/api/attendance`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/attendance/${id}`,
    BY_SESSION: (sessionId: string) => `${EDUCATION_CORE_BASE}/api/attendance/session/${sessionId}`,
    BY_STUDENT: (studentId: string) => `${EDUCATION_CORE_BASE}/api/attendance/students/${studentId}`,
    // JWT-scoped self-service (student portal) — resolved server-side, no id needed.
    ME: `${EDUCATION_CORE_BASE}/api/attendance/me`,
    JUSTIFY: (id: string) => `${EDUCATION_CORE_BASE}/api/attendance/${id}/justify`,
    INITIALIZE: (sessionId: string) => `${EDUCATION_CORE_BASE}/api/attendance/initialize/${sessionId}`,
    BULK_UPDATE: `${EDUCATION_CORE_BASE}/api/attendance/bulk-update`,
    UPDATE_STATUS: (id: string) => `${EDUCATION_CORE_BASE}/api/attendance/${id}/status`,
    FILTER: (params?: { studentId?: string; sessionId?: string; date?: string }) => {
      const query = new URLSearchParams();
      if (params?.studentId) query.set("studentId", params.studentId);
      if (params?.sessionId) query.set("sessionId", params.sessionId);
      if (params?.date) query.set("date", params.date);
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/attendance${qs ? `?${qs}` : ""}`;
    },
  },

  SESSIONS: {
    BASE: `${EDUCATION_CORE_BASE}/api/sessions`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/sessions/${id}`,
    BY_INSTRUCTOR: (instructorId: string) => `${EDUCATION_CORE_BASE}/api/sessions/instructor/${instructorId}`,
    BY_INSTRUCTOR_AND_DATE: (instructorId: string, date: string) =>
      `${EDUCATION_CORE_BASE}/api/sessions/instructor/${instructorId}/date/${date}`,
    BY_DEPARTMENT_AND_CLASS: (departmentId: string, classGroupId: string) =>
      `${EDUCATION_CORE_BASE}/api/sessions/department/${departmentId}/class/${classGroupId}`,
    UPCOMING: (params?: { instructorId?: string; classGroupId?: string; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.instructorId) query.set("instructorId", params.instructorId);
      if (params?.classGroupId) query.set("classGroupId", params.classGroupId);
      if (params?.limit !== undefined) query.set("limit", String(params.limit));
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/sessions/upcoming${qs ? `?${qs}` : ""}`;
    },
    BY_CLASSGROUP_WEEK: (classGroupId: string, weekStart: string) =>
      `${EDUCATION_CORE_BASE}/api/sessions/class-group/${classGroupId}/week?weekStart=${encodeURIComponent(weekStart)}`,
    BY_CLASSGROUP_WEEK_GROUPED: (classGroupId: string, weekStart: string) =>
      `${EDUCATION_CORE_BASE}/api/sessions/class-group/${classGroupId}/week/grouped?weekStart=${encodeURIComponent(weekStart)}`,
    FILTER: (params?: { managerId?: string; classGroupId?: string; instructorId?: string }) => {
      const query = new URLSearchParams();
      if (params?.managerId) query.set("managerId", params.managerId);
      if (params?.classGroupId) query.set("classGroupId", params.classGroupId);
      if (params?.instructorId) query.set("instructorId", params.instructorId);
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/sessions${qs ? `?${qs}` : ""}`;
    },
  },

  AUDIT_LOGS: {
    BASE: `${EDUCATION_CORE_BASE}/api/audit-logs`,
    STATS: `${EDUCATION_CORE_BASE}/api/audit-logs/stats`,
    EXPORT: `${EDUCATION_CORE_BASE}/api/audit-logs/export`,
  },

  DISCIPLINE: {
    BASE: `${EDUCATION_CORE_BASE}/api/discipline`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/discipline/${id}`,
    STATS: `${EDUCATION_CORE_BASE}/api/discipline/stats`,
  },

  GRADES: {
    BASE: `${EDUCATION_CORE_BASE}/api/grades`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/grades/${id}`,
    BY_STUDENT: (studentId: string) => `${EDUCATION_CORE_BASE}/api/grades/student/${studentId}`,
    // JWT-scoped self-service (student portal) — resolved server-side, no id needed.
    ME: `${EDUCATION_CORE_BASE}/api/grades/me`,
    BY_SUBJECT: (subjectId: string) => `${EDUCATION_CORE_BASE}/api/grades/subject/${subjectId}`,
    FILTER: (params?: { studentId?: string; subjectId?: string; instructorId?: string; page?: number; size?: number }) => {
      const query = new URLSearchParams();
      if (params?.studentId) query.set('studentId', params.studentId);
      if (params?.subjectId) query.set('subjectId', params.subjectId);
      if (params?.instructorId) query.set('instructorId', params.instructorId);
      if (params?.page !== undefined) query.set('page', String(params.page));
      if (params?.size !== undefined) query.set('size', String(params.size));
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/grades${qs ? `?${qs}` : ''}`;
    },
  },

  REPORTS: {
    ATTENDANCE_STUDENT: (studentId: string) => `${EDUCATION_CORE_BASE}/api/reports/attendance/student/${studentId}`,
    ATTENDANCE_CLASS_GROUP: (classGroupId: string) =>
      `${EDUCATION_CORE_BASE}/api/reports/attendance/class-group/${classGroupId}`,
    GRADES_STUDENT: (studentId: string) => `${EDUCATION_CORE_BASE}/api/reports/grades/student/${studentId}`,
    GRADES_SUBJECT: (subjectId: string) => `${EDUCATION_CORE_BASE}/api/reports/grades/subject/${subjectId}`,
    // JWT-scoped self-service (student portal) — resolved server-side, no id needed.
    ATTENDANCE_ME: `${EDUCATION_CORE_BASE}/api/reports/attendance/me`,
    GRADES_ME: `${EDUCATION_CORE_BASE}/api/reports/grades/me`,
    // Returns a self-contained HTML document (inline logos) — not JSON.
    ATTESTATION_SCOLARITE: (studentId: string) =>
      `${EDUCATION_CORE_BASE}/api/reports/students/${studentId}/attestation-scolarite`,
  },

  // Core validations (`validation.api.ValidationController`, bean `coreValidationController`) — unchanged, stays at /api/validations.
  VALIDATIONS: {
    BASE: `${EDUCATION_CORE_BASE}/api/validations`,
    FILTER: (params?: { targetId?: string }) => {
      const query = new URLSearchParams();
      if (params?.targetId) query.set("targetId", params.targetId);
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/validations${qs ? `?${qs}` : ""}`;
    },
  },

  // Manager validations (`manager.api.ValidationController`, bean `managerValidationController`) —
  // moved from /api/validations to /api/manager/validations to resolve the prefix conflict with VALIDATIONS above.
  MANAGER_VALIDATIONS: {
    ATTENDANCE_PENDING: (params?: { classGroupId?: string; subjectId?: string }) => {
      const query = new URLSearchParams();
      if (params?.classGroupId) query.set("classGroupId", params.classGroupId);
      if (params?.subjectId) query.set("subjectId", params.subjectId);
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/manager/validations/attendances/pending${qs ? `?${qs}` : ""}`;
    },
    ATTENDANCE_VALIDATE: (attendanceId: string) =>
      `${EDUCATION_CORE_BASE}/api/manager/validations/attendances/${attendanceId}/validate`,
    ATTENDANCE_BULK_VALIDATE: `${EDUCATION_CORE_BASE}/api/manager/validations/attendances/bulk-validate`,
    STATS: (managerId?: string) =>
      `${EDUCATION_CORE_BASE}/api/manager/validations/stats${managerId ? `?managerId=${managerId}` : ""}`,
  },

  // The contract ("who teaches what, to which class") a Session's `teachingAssignmentId` points to (§2.19).
  TEACHING_ASSIGNMENTS: {
    BASE: `${EDUCATION_CORE_BASE}/api/teaching-assignments`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/teaching-assignments/${id}`,
    CANCEL: (id: string) => `${EDUCATION_CORE_BASE}/api/teaching-assignments/${id}/cancel`,
    // Only one of departmentId/classGroupId/instructorId at a time per the backend contract.
    FILTER: (params?: { departmentId?: string; classGroupId?: string; instructorId?: string }) => {
      const query = new URLSearchParams();
      if (params?.departmentId) query.set("departmentId", params.departmentId);
      if (params?.classGroupId) query.set("classGroupId", params.classGroupId);
      if (params?.instructorId) query.set("instructorId", params.instructorId);
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/teaching-assignments${qs ? `?${qs}` : ""}`;
    },
  },

  MANAGERS: {
    BASE: `${EDUCATION_CORE_BASE}/api/managers`,
    BY_ID: (id: string) => `${EDUCATION_CORE_BASE}/api/managers/${id}`,
    BY_USER_ID: (userId: string) => `${EDUCATION_CORE_BASE}/api/managers/user/${userId}`,
    BY_EMPLOYEE_NUMBER: (employeeNumber: string) => `${EDUCATION_CORE_BASE}/api/managers/employee/${employeeNumber}`,
    // JWT-scoped self-service (manager portal) — resolved server-side, no id needed.
    ME: `${EDUCATION_CORE_BASE}/api/managers/me`,
    ACTIVE: `${EDUCATION_CORE_BASE}/api/managers/active`,
    BY_LEVEL: (level: string, page?: number, size?: number) => {
      const query = new URLSearchParams();
      if (page !== undefined) query.set("page", String(page));
      if (size !== undefined) query.set("size", String(size));
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/managers/level/${level}${qs ? `?${qs}` : ""}`;
    },
    SEARCH: (query: string) => `${EDUCATION_CORE_BASE}/api/managers/search?query=${encodeURIComponent(query)}`,
    UPDATE_STATUS: (id: string, status: string) =>
      `${EDUCATION_CORE_BASE}/api/managers/${id}/status?status=${encodeURIComponent(status)}`,
    DEPARTMENTS: (managerId: string) => `${EDUCATION_CORE_BASE}/api/managers/${managerId}/department/class-groups`,
    SESSIONS: (managerId: string) => `${EDUCATION_CORE_BASE}/api/managers/${managerId}/department/sessions`,
    ATTENDANCE: (managerId: string) => `${EDUCATION_CORE_BASE}/api/managers/${managerId}/department/attendance`,
    UPDATE_ATTENDANCE: (managerId: string, attendanceId: string) =>
      `${EDUCATION_CORE_BASE}/api/managers/${managerId}/attendance/${attendanceId}/status`,
    // Creates a TeachingAssignment scoped to the manager's own department (§2.19).
    TEACHING_ASSIGNMENTS: (managerId: string) =>
      `${EDUCATION_CORE_BASE}/api/managers/${managerId}/teaching-assignments`,
    // Jury phase: moves a repeating student into a different cohort of the same level.
    REPETITIONS: (managerId: string) => `${EDUCATION_CORE_BASE}/api/managers/${managerId}/department/repetitions`,
    // Read-only: diplomas issued to students of this manager's department.
    DIPLOMAS: (managerId: string) => `${EDUCATION_CORE_BASE}/api/managers/${managerId}/department/diplomas`,
  },

  MANAGER_ACTIONS: {
    BASE: `${EDUCATION_CORE_BASE}/api/manager-actions`,
    BY_MANAGER: (managerId: string, page?: number, size?: number) => {
      const query = new URLSearchParams();
      if (page !== undefined) query.set("page", String(page));
      if (size !== undefined) query.set("size", String(size));
      const qs = query.toString();
      return `${EDUCATION_CORE_BASE}/api/manager-actions/manager/${managerId}${qs ? `?${qs}` : ""}`;
    },
    BY_MANAGER_AND_TYPE: (managerId: string, actionType: string) =>
      `${EDUCATION_CORE_BASE}/api/manager-actions/manager/${managerId}/type/${actionType}`,
    BY_MANAGER_PERIOD: (managerId: string, start: string, end: string) =>
      `${EDUCATION_CORE_BASE}/api/manager-actions/manager/${managerId}/period?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    RECENT: (managerId: string, limit?: number) =>
      `${EDUCATION_CORE_BASE}/api/manager-actions/manager/${managerId}/recent${limit !== undefined ? `?limit=${limit}` : ""}`,
    STATISTICS: (managerId: string, days?: number) =>
      `${EDUCATION_CORE_BASE}/api/manager-actions/manager/${managerId}/statistics${days !== undefined ? `?days=${days}` : ""}`,
  },

  MANAGER_ASSIGNMENTS: {
    BASE: `${EDUCATION_CORE_BASE}/api/manager-assignments`,
    BY_MANAGER: (managerId: string) => `${EDUCATION_CORE_BASE}/api/manager-assignments/manager/${managerId}`,
    BY_MANAGER_ACTIVE: (managerId: string) =>
      `${EDUCATION_CORE_BASE}/api/manager-assignments/manager/${managerId}/active`,
    BY_DEPARTMENT: (departmentId: string) => `${EDUCATION_CORE_BASE}/api/manager-assignments/department/${departmentId}`,
    BY_CLASS: (classGroupId: string) => `${EDUCATION_CORE_BASE}/api/manager-assignments/class/${classGroupId}`,
    BY_MANAGER_AND_TYPE: (managerId: string, type: string) =>
      `${EDUCATION_CORE_BASE}/api/manager-assignments/manager/${managerId}/type/${type}`,
    // v0: `revokedBy` is resolved server-side from the caller's JWT, no longer a client-supplied query param.
    DELETE: (assignmentId: string) => `${EDUCATION_CORE_BASE}/api/manager-assignments/${assignmentId}`,
  },

  MANAGER_RESPONSIBILITIES: {
    BASE: `${EDUCATION_CORE_BASE}/api/manager-responsibilities`,
    BY_ID: (responsibilityId: string) => `${EDUCATION_CORE_BASE}/api/manager-responsibilities/${responsibilityId}`,
    BY_MANAGER: (managerId: string) => `${EDUCATION_CORE_BASE}/api/manager-responsibilities/manager/${managerId}`,
    APPROVALS: (managerId: string) =>
      `${EDUCATION_CORE_BASE}/api/manager-responsibilities/manager/${managerId}/approvals`,
    CHECK: (managerId: string, type: string) =>
      `${EDUCATION_CORE_BASE}/api/manager-responsibilities/manager/${managerId}/check/${type}`,
    CAN_APPROVE: (managerId: string, type: string) =>
      `${EDUCATION_CORE_BASE}/api/manager-responsibilities/manager/${managerId}/can-approve/${type}`,
  },

  ADMIN: {
    DASHBOARD_STATS: `${EDUCATION_CORE_BASE}/api/admin/stats`,
  },

  BACKUPS: {
    BASE: `${EDUCATION_CORE_BASE}/api/admin/backups`,
    RESTORE: (id: string) => `${EDUCATION_CORE_BASE}/api/admin/backups/${id}/restore`,
  },

  SYSTEM_CONFIG: {
    BASE: `${EDUCATION_CORE_BASE}/api/admin/config`,
    BY_KEY: (key: string) => `${EDUCATION_CORE_BASE}/api/admin/config/${key}`,
  },

  PERMISSIONS: {
    BASE: `${EDUCATION_CORE_BASE}/api/admin/permissions`,
  },

  // communication-hub-service (messaging + notifications)
  MESSAGES: {
    SEND: `${COMMUNICATION_HUB_BASE}/api/messages/send`,
    BY_ID: (id: string) => `${COMMUNICATION_HUB_BASE}/api/messages/${id}`,
    INBOX: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/messages/inbox/${userId}`,
    SENT: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/messages/sent/${userId}`,
    STARRED: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/messages/starred/${userId}`,
    ARCHIVED: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/messages/archived/${userId}`,
    THREAD: (parentMessageId: string) => `${COMMUNICATION_HUB_BASE}/api/messages/thread/${parentMessageId}`,
    UNREAD_COUNT: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/messages/unread/${userId}/count`,
    // JWT-scoped self-service (student portal) — resolved server-side, no id needed.
    INBOX_ME: `${COMMUNICATION_HUB_BASE}/api/messages/inbox/me`,
    UNREAD_COUNT_ME: `${COMMUNICATION_HUB_BASE}/api/messages/unread/me/count`,
    READ: (messageId: string, receiverId: string) =>
      `${COMMUNICATION_HUB_BASE}/api/messages/${messageId}/read/${receiverId}`,
    STAR: (messageId: string, receiverId: string) =>
      `${COMMUNICATION_HUB_BASE}/api/messages/${messageId}/star/${receiverId}`,
    ARCHIVE: (messageId: string, receiverId: string) =>
      `${COMMUNICATION_HUB_BASE}/api/messages/${messageId}/archive/${receiverId}`,
    DELETE: (messageId: string, receiverId: string) =>
      `${COMMUNICATION_HUB_BASE}/api/messages/${messageId}/receiver/${receiverId}`,
  },

  NOTIFICATIONS: {
    BASE: `${COMMUNICATION_HUB_BASE}/api/notifications`,
    BY_ID: (id: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/${id}`,
    BY_USER: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/user/${userId}`,
    UNREAD: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/user/${userId}/unread`,
    UNREAD_COUNT: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/user/${userId}/unread/count`,
    // JWT-scoped self-service (student portal) — resolved server-side, no id needed.
    BY_USER_ME: `${COMMUNICATION_HUB_BASE}/api/notifications/user/me`,
    UNREAD_COUNT_ME: `${COMMUNICATION_HUB_BASE}/api/notifications/user/me/unread/count`,
    BY_TYPE: (userId: string, type: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/user/${userId}/type/${type}`,
    BY_CHANNEL: (userId: string, channel: string) =>
      `${COMMUNICATION_HUB_BASE}/api/notifications/user/${userId}/channel/${channel}`,
    READ: (id: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/${id}/read`,
    DISMISS: (id: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/${id}/dismiss`,
    READ_ALL: (userId: string) => `${COMMUNICATION_HUB_BASE}/api/notifications/user/${userId}/read-all`,
  },
};
