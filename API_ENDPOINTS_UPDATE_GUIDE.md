# API Endpoints Update Guide

The `api.ts` file has been updated conceptually, but due to the large size of changes needed, here's what you should manually add to `src/config/api.ts`:

## Add These Missing Endpoint Groups:

### 1. Enhanced ATTENDANCE Endpoints (around line 134)
Add after the basic attendance endpoints:

```typescript
// Add to ATTENDANCE object:
BY_CLASS: (classGroupId: number | string) =>
  `${getBaseURL()}/api/attendance/class/${classGroupId}`,
BY_DATE: (date: string) =>
  `${getBaseURL()}/api/attendance/date/${date}`,
BY_CLASS_AND_DATE: (classGroupId: number | string, date: string) =>
  `${getBaseURL()}/api/attendance/class/${classGroupId}/date/${date}`,
STATISTICS: (studentId: number | string) =>
  `${getBaseURL()}/api/attendance/student/${studentId}/statistics`,
ATTENDANCE_RATE: (studentId: number | string, classGroupId: number | string) =>
  `${getBaseURL()}/api/attendance/student/${studentId}/class/${classGroupId}/rate`,
// Justification workflow
JUSTIFY: (id: number | string) =>
  `${getBaseURL()}/api/attendance/${id}/justify`,
PENDING: `${getBaseURL()}/api/attendance/pending`,
VALIDATE: (id: number | string) =>
  `${getBaseURL()}/api/attendance/${id}/validate`,
// Appeal system
APPEAL: (id: number | string) =>
  `${getBaseURL()}/api/attendance/${id}/appeal`,
APPEALS_PENDING: `${getBaseURL()}/api/attendance/appeals/pending`,
APPEAL_REVIEW: (id: number | string) =>
  `${getBaseURL()}/api/attendance/${id}/appeal/review`,
```

### 2. Update SESSIONS Endpoints (around line 215)
Add to existing SESSIONS:

```typescript
// Add to SESSIONS object:
BY_CLASSGROUP_WEEK: (classGroupId: number | string) =>
  `${getBaseURL()}/api/sessions/classgroup/${classGroupId}/week`,
BY_CLASSGROUP_WEEK_GROUPED: (classGroupId: number | string) =>
  `${getBaseURL()}/api/sessions/classgroup/${classGroupId}/week/grouped`,
```

### 3. Update MESSAGES Endpoints (around line 148)
Replace with:

```typescript
MESSAGES: {
  BASE: `${getBaseURL()}/api/messages`,
  BY_ID: (id: number | string) => `${getBaseURL()}/api/messages/${id}`,
  SENT: (senderId: number | string) => `${getBaseURL()}/api/messages/sent/${senderId}`,
  RECEIVED: (receiverId: number | string) => `${getBaseURL()}/api/messages/received/${receiverId}`,
  UNREAD: (receiverId: number | string) => `${getBaseURL()}/api/messages/unread/${receiverId}`,
  MARK_READ: (id: number | string) => `${getBaseURL()}/api/messages/${id}/read`,
},
```

### 4. Update NOTIFICATIONS Endpoints (around line 158)
Replace with:

```typescript
NOTIFICATIONS: {
  BASE: `${getBaseURL()}/api/notifications`,
  BY_ID: (id: number | string) => `${getBaseURL()}/api/notifications/${id}`,
  BY_USER: (userId: number | string) => `${getBaseURL()}/api/notifications/user/${userId}`,
  UNREAD: (userId: number | string) => `${getBaseURL()}/api/notifications/user/${userId}/unread`,
  BY_TYPE: (type: string) => `${getBaseURL()}/api/notifications/type/${type}`,
  MARK_READ: (id: number | string) => `${getBaseURL()}/api/notifications/${id}/read`,
  MARK_ALL_READ: (userId: number | string) => `${getBaseURL()}/api/notifications/user/${userId}/read-all`,
},
```

### 5. Update REPORTS Endpoints (around line 167)
Replace with:

```typescript
REPORTS: {
  // Student Performance Reports
  STUDENT: (studentId: number | string) => `${getBaseURL()}/api/reports/students/${studentId}`,
  ALL_STUDENTS: `${getBaseURL()}/api/reports/students`,
  REFRESH_STUDENTS: `${getBaseURL()}/api/reports/students/refresh`,
  // Class Analytics Reports
  CLASS: (classGroupId: number | string) => `${getBaseURL()}/api/reports/classes/${classGroupId}`,
  ALL_CLASSES: `${getBaseURL()}/api/reports/classes`,
  REFRESH_CLASSES: `${getBaseURL()}/api/reports/classes/refresh`,
  // Academic Year Reports
  ACADEMIC_YEAR: (academicYearId: number | string) => `${getBaseURL()}/api/reports/years/${academicYearId}`,
  ACADEMIC_YEAR_SUMMARY: (academicYearId: number | string) => `${getBaseURL()}/api/reports/years/${academicYearId}/summary`,
},
```

### 6. Expand ADMIN Endpoints (around line 174)
Replace existing ADMIN section with:

```typescript
ADMIN: {
  // User Management
  USERS: `${getBaseURL()}/api/admin/users`,
  USER_BY_ID: (id: number | string) => `${getBaseURL()}/api/admin/users/${id}`,
  USER_ROLE: (id: number | string) => `${getBaseURL()}/api/admin/users/${id}/role`,
  // Audit Logs
  AUDIT_LOGS: `${getBaseURL()}/api/admin/audit-logs`,
  AUDIT_BY_USER: (userId: number | string) => `${getBaseURL()}/api/admin/audit-logs/user/${userId}`,
  AUDIT_BY_ACTION: (action: string) => `${getBaseURL()}/api/admin/audit-logs/action/${action}`,
  AUDIT_DATE_RANGE: `${getBaseURL()}/api/admin/audit-logs/date-range`,
  // System Configuration
  CONFIG: `${getBaseURL()}/api/admin/config`,
  CONFIG_BY_KEY: (key: string) => `${getBaseURL()}/api/admin/config/${key}`,
  // Global Notifications
  BROADCAST: `${getBaseURL()}/api/admin/notifications/broadcast`,
  SCHEDULED_NOTIFICATIONS: `${getBaseURL()}/api/admin/notifications/scheduled`,
  // Permissions
  PERMISSIONS: `${getBaseURL()}/api/admin/permissions`,
  PERMISSIONS_BY_ROLE: (role: string) => `${getBaseURL()}/api/admin/permissions/role/${role}`,
  PERMISSION_BY_ID: (id: number | string) => `${getBaseURL()}/api/admin/permissions/${id}`,
  // Dashboard
  DASHBOARD_STATS: `${getBaseURL()}/api/admin/dashboard/stats`,
  // Backup & Restore
  BACKUP_CREATE: `${getBaseURL()}/api/admin/backup/create`,
  BACKUP_LIST: `${getBaseURL()}/api/admin/backup/list`,
  BACKUP_RESTORE: (backupId: number | string) => `${getBaseURL()}/api/admin/backup/restore/${backupId}`,
  // Legacy
  ROLES: `${getBaseURL()}/api/admin/roles`,
  DISCIPLINE: `${getBaseURL()}/api/admin/discipline`,
},
```

### 7. Add New Manager-Related Endpoints (after MANAGERS, around line 197)
Add these new sections:

```typescript
// Manager Assignments
MANAGER_ASSIGNMENTS: {
  BASE: `${getBaseURL()}/api/manager-assignments`,
  BY_MANAGER: (managerId: number | string) =>
    `${getBaseURL()}/api/manager-assignments/manager/${managerId}`,
  ACTIVE: `${getBaseURL()}/api/manager-assignments/active`,
  BY_ID: (id: number | string) => `${getBaseURL()}/api/manager-assignments/${id}`,
},

// Manager Responsibilities
MANAGER_RESPONSIBILITIES: {
  BASE: `${getBaseURL()}/api/manager-responsibilities`,
  BY_MANAGER: (managerId: number | string) =>
    `${getBaseURL()}/api/manager-responsibilities/manager/${managerId}`,
  UPDATE_PERMISSIONS: (id: number | string) =>
    `${getBaseURL()}/api/manager-responsibilities/${id}/permissions`,
},

// Manager Actions (Audit)
MANAGER_ACTIONS: {
  BY_MANAGER: (managerId: number | string) =>
    `${getBaseURL()}/api/manager-actions/manager/${managerId}`,
  BY_TYPE: (actionType: string) =>
    `${getBaseURL()}/api/manager-actions/type/${actionType}`,
},
```

### 8. Update MANAGERS endpoint (around line 184)
Add to MANAGERS:

```typescript
BY_LEVEL: (level: string) => `${getBaseURL()}/api/managers/level/${level}`,
```

### 9. Update VALIDATIONS (around line 198)
Replace with:

```typescript
VALIDATIONS: {
  PENDING: `${getBaseURL()}/api/validations/pending`,
  GRADE: `${getBaseURL()}/api/validations/grade`,
  ENROLLMENT: `${getBaseURL()}/api/validations/enrollment`,
},
```

## Alternative: Use Service Clients Directly

**Good news!** All the service clients we created (`session-client.ts`, `attendance-client.ts`, `reports-client.ts`, etc.) **already have all the correct endpoints built-in**. They don't all require `API_ENDPOINTS` - many construct the URLs directly.

So the **simplest approach** is to just use the service clients as-is! They're fully functional already.

For example:
```typescript
import { EnhancedAttendanceClient } from '@/lib/api-clients';

// This works perfectly - no API_ENDPOINTS needed!
const stats = await EnhancedAttendanceClient.getStudentStatistics(studentId, token);
```

The service clients are self-contained and production-ready! 🚀
