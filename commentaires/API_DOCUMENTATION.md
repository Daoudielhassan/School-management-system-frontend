# 📚 API Documentation - SMS Microservices

Documentation complète de toutes les APIs REST des 11 microservices du système de gestion scolaire.

**Date**: 25 janvier 2026  
**Version**: 1.0.0  
**Services**: 11 microservices  
**Total Controllers**: 35 controllers  
**Base URL**: `http://localhost:{port}`

---

## Table des matières

1. [Identity Service](#1-identity-service-port-9000)
2. [Academic Year Service](#2-academic-year-service-port-9000)
3. [Academic Structure Service](#3-academic-structure-service-port-9000)
4. [Student Service](#4-student-service-port-9000)
5. [Instructor Service](#5-instructor-service-port-9000)
6. [Attendance Service](#6-attendance-service-port-9000)
7. [Messaging Service](#7-messaging-service-port-8091)
8. [Notification Service](#8-notification-service-port-8092)
9. [Report Service](#9-report-service-port-8093)
10. [Admin Service](#10-admin-service-port-8094)
11. [Manager Service](#11-manager-service-port-8095)

---

## 1. Identity Service (Port: 9000)

Service d'authentification et gestion des identités avec JWT.

### 1.1 AuthController - `/api/auth`

#### POST `/api/auth/login`
**Description**: Authentification utilisateur  
**Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**: `LoginResponse` (200 OK)
```json
{
  "token": "eyJhbGci...",
  "type": "Bearer",
  "username": "john.doe",
  "roles": ["ROLE_STUDENT"]
}
```

#### POST `/api/auth/register`
**Description**: Créer un nouveau compte  
**Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "roles": ["ROLE_STUDENT"]
}
```
**Response**: `UserDTO` (200 OK)

#### GET `/api/auth/validate`
**Description**: Valider un token JWT  
**Query Params**: `token` (string)  
**Response**: `boolean` (200 OK)

### 1.2 UserController - `/api/users`

#### GET `/api/users`
**Description**: Liste tous les utilisateurs  
**Response**: `List<UserDTO>` (200 OK)

#### GET `/api/users/{id}`
**Description**: Obtenir un utilisateur par ID  
**Response**: `UserDTO` (200 OK)

#### GET `/api/users/username/{username}`
**Description**: Rechercher par username  
**Response**: `UserDTO` (200 OK)

#### GET `/api/users/email/{email}`
**Description**: Rechercher par email  
**Response**: `UserDTO` (200 OK)

#### GET `/api/users/role/{role}`
**Description**: Obtenir utilisateurs par rôle  
**Path Params**: `role` (ADMIN, MANAGER, INSTRUCTOR, STUDENT)  
**Response**: `List<UserDTO>` (200 OK)

#### PUT `/api/users/{id}/enable`
**Description**: Activer un utilisateur  
**Response**: void (200 OK)

#### PUT `/api/users/{id}/disable`
**Description**: Désactiver un utilisateur  
**Response**: void (200 OK)

#### PUT `/api/users/{id}/change-password`
**Description**: Changer le mot de passe  
**Query Params**: `newPassword` (string)  
**Response**: void (200 OK)

#### DELETE `/api/users/{id}`
**Description**: Supprimer un utilisateur  
**Response**: void (200 OK)

---

## 2. Academic Year Service (Port: 9000)

Service de gestion des années académiques et semestres.

### 2.1 AcademicYearController - `/api/academic-years`

#### POST `/api/academic-years`
**Description**: Créer une année académique  
**Body**: `AcademicYearCreateRequest`
**Response**: `AcademicYearResponse` (201 Created)

#### GET `/api/academic-years`
**Description**: Liste toutes les années académiques  
**Response**: `List<AcademicYearResponse>` (200 OK)

#### GET `/api/academic-years/{id}`
**Description**: Obtenir par ID  
**Response**: `AcademicYearResponse` (200 OK)

#### GET `/api/academic-years/active`
**Description**: Obtenir l'année académique active  
**Response**: `AcademicYearResponse` (200 OK)

#### GET `/api/academic-years/status/{status}`
**Description**: Filtrer par statut (ACTIVE, COMPLETED, ARCHIVED)  
**Response**: `List<AcademicYearResponse>` (200 OK)

#### PUT `/api/academic-years/{id}`
**Description**: Mettre à jour  
**Body**: `AcademicYearUpdateRequest`  
**Response**: `AcademicYearResponse` (200 OK)

#### PATCH `/api/academic-years/{id}/status`
**Description**: Changer le statut  
**Query Params**: `status` (string)  
**Response**: `AcademicYearResponse` (200 OK)

#### DELETE `/api/academic-years/{id}`
**Description**: Supprimer  
**Response**: void (204 No Content)

### 2.2 SemesterController - `/api/semesters`

#### POST `/api/semesters`
**Description**: Créer un semestre  
**Body**: `SemesterCreateRequest`
**Response**: `SemesterResponse` (201 Created)

#### GET `/api/semesters`
**Description**: Liste tous les semestres  
**Response**: `List<SemesterResponse>` (200 OK)

#### GET `/api/semesters/{id}`
**Description**: Obtenir par ID  
**Response**: `SemesterResponse` (200 OK)

#### GET `/api/semesters/year/{academicYearId}`
**Description**: Semestres par année académique  
**Response**: `List<SemesterResponse>` (200 OK)

#### PUT `/api/semesters/{id}`
**Description**: Mettre à jour  
**Body**: `SemesterUpdateRequest`  
**Response**: `SemesterResponse` (200 OK)

#### DELETE `/api/semesters/{id}`
**Description**: Supprimer  
**Response**: void (204 No Content)

---

## 3. Academic Structure Service (Port: 9000)

Service de gestion de la structure académique (départements, classes, modules, matières, offres, sessions).

### 3.1 DepartmentController - `/api/departments`

#### POST `/api/departments`
**Description**: Créer un département  
**Body**: `DepartmentCreateRequest`
**Response**: `DepartmentResponse` (201 Created)

#### GET `/api/departments`
**Description**: Liste tous les départements  
**Response**: `List<DepartmentResponse>` (200 OK)

#### GET `/api/departments/{id}`
**Description**: Obtenir par ID  
**Response**: `DepartmentResponse` (200 OK)

#### GET `/api/departments/code/{code}`
**Description**: Obtenir par code  
**Response**: `DepartmentResponse` (200 OK)

#### PUT `/api/departments/{id}`
**Description**: Mettre à jour  
**Body**: `DepartmentUpdateRequest`  
**Response**: `DepartmentResponse` (200 OK)

#### DELETE `/api/departments/{id}`
**Description**: Supprimer  
**Response**: void (204 No Content)

### 3.2 ClassGroupController - `/api/class-groups`

#### POST `/api/class-groups`
**Description**: Créer une classe  
**Body**: `ClassGroupCreateRequest`
**Response**: `ClassGroupResponse` (201 Created)

#### GET `/api/class-groups`
**Description**: Liste toutes les classes  
**Response**: `List<ClassGroupResponse>` (200 OK)

#### GET `/api/class-groups/{id}`
**Description**: Obtenir par ID  
**Response**: `ClassGroupResponse` (200 OK)

#### PUT `/api/class-groups/{id}`
**Description**: Mettre à jour  
**Body**: `ClassGroupUpdateRequest`  
**Response**: `ClassGroupResponse` (200 OK)

#### DELETE `/api/class-groups/{id}`
**Description**: Supprimer  
**Response**: void (204 No Content)

### 3.3 ModuleController - `/api/modules`

#### POST `/api/modules`
**Body**: `ModuleCreateRequest`
**Response**: `ModuleResponse` (201 Created)

#### GET `/api/modules`
**Response**: `List<ModuleResponse>` (200 OK)

#### GET `/api/modules/{id}`
**Response**: `ModuleResponse` (200 OK)

#### PUT `/api/modules/{id}`
**Body**: `ModuleUpdateRequest`  
**Response**: `ModuleResponse` (200 OK)

#### DELETE `/api/modules/{id}`
**Response**: void (204 No Content)

### 3.4 SubjectController - `/api/subjects`

#### POST `/api/subjects`
**Body**: `SubjectCreateRequest`
**Response**: `SubjectResponse` (201 Created)

#### GET `/api/subjects`
**Response**: `List<SubjectResponse>` (200 OK)

#### GET `/api/subjects/{id}`
**Response**: `SubjectResponse` (200 OK)

#### PUT `/api/subjects/{id}`
**Body**: `SubjectUpdateRequest`  
**Response**: `SubjectResponse` (200 OK)

#### DELETE `/api/subjects/{id}`
**Response**: void (204 No Content)

### 3.5 SubjectOfferingController - `/api/subject-offerings`

#### POST `/api/subject-offerings`
**Body**: `SubjectOfferingCreateRequest`
**Response**: `SubjectOfferingResponse` (201 Created)

#### GET `/api/subject-offerings`
**Response**: `List<SubjectOfferingResponse>` (200 OK)

#### GET `/api/subject-offerings/{id}`
**Response**: `SubjectOfferingResponse` (200 OK)

#### PUT `/api/subject-offerings/{id}`
**Body**: `SubjectOfferingUpdateRequest`  
**Response**: `SubjectOfferingResponse` (200 OK)

#### DELETE `/api/subject-offerings/{id}`
**Response**: void (204 No Content)

### 3.6 SessionController ⭐ - `/api/sessions`

#### POST `/api/sessions`
**Description**: Créer une session de cours  
**Body**:
```json
{
  "subjectOfferingId": "uuid",
  "date": "2026-01-25T10:00:00",
  "room": "Amphi A",
  "status": "SCHEDULED"
}
```
**Response**: `SessionResponse` (201 Created)

#### GET `/api/sessions`
**Description**: Liste toutes les sessions  
**Response**: `List<SessionResponse>` (200 OK)

#### GET `/api/sessions/{id}`
**Description**: Obtenir par ID  
**Response**: `SessionResponse` (200 OK)

#### GET `/api/sessions/classgroup/{classGroupId}/week`
**Description**: Emploi du temps hebdomadaire (liste)  
**Query Params**: `date` (optional, LocalDate)  
**Response**: `List<SessionResponse>` (200 OK)

#### GET `/api/sessions/classgroup/{classGroupId}/week/grouped` 🔥
**Description**: Emploi du temps groupé par jour (avec cache)  
**Query Params**: `date` (optional, LocalDate)  
**Response**: `Map<String, List<SessionResponse>>` (200 OK)
```json
{
  "2026-01-27": [...],
  "2026-01-28": [...],
  ...
}
```
**Features**:
- ✅ Cache Caffeine
- ✅ Circuit Breaker pour instructor-service
- ✅ Batch fetching des instructeurs

#### PUT `/api/sessions/{id}`
**Body**: `SessionUpdateRequest`  
**Response**: `SessionResponse` (200 OK)

#### DELETE `/api/sessions/{id}`
**Response**: void (204 No Content)

---

## 4. Student Service (Port: 9000)

Service de gestion des étudiants et inscriptions.

### 4.1 StudentController - `/api/students`

#### POST `/api/students`
**Body**: `StudentCreateRequest`
**Response**: `StudentResponse` (201 Created)

#### GET `/api/students`
**Response**: `List<StudentResponse>` (200 OK)

#### GET `/api/students/{id}`
**Response**: `StudentResponse` (200 OK)

#### GET `/api/students/number/{studentNumber}`
**Description**: Recherche par numéro étudiant  
**Response**: `StudentResponse` (200 OK)

#### GET `/api/students/email/{email}`
**Response**: `StudentResponse` (200 OK)

#### GET `/api/students/user/{userId}`
**Response**: `StudentResponse` (200 OK)

#### GET `/api/students/status/{status}`
**Description**: Filtrer par statut (ACTIVE, INACTIVE, GRADUATED, SUSPENDED)  
**Response**: `List<StudentResponse>` (200 OK)

#### GET `/api/students/search`
**Query Params**: `query` (string)  
**Response**: `List<StudentResponse>` (200 OK)

#### PUT `/api/students/{id}`
**Body**: `StudentUpdateRequest`  
**Response**: `StudentResponse` (200 OK)

#### PATCH `/api/students/{id}/status`
**Query Params**: `status` (StudentStatus)  
**Response**: `StudentResponse` (200 OK)

#### DELETE `/api/students/{id}`
**Response**: void (204 No Content)

### 4.2 StudentEnrollmentController - `/api/enrollments`

#### POST `/api/enrollments`
**Body**: `EnrollmentCreateRequest`
**Response**: `EnrollmentResponse` (201 Created)

#### GET `/api/enrollments`
**Response**: `List<EnrollmentResponse>` (200 OK)

#### GET `/api/enrollments/{id}`
**Response**: `EnrollmentResponse` (200 OK)

#### GET `/api/enrollments/student/{studentId}`
**Response**: `List<EnrollmentResponse>` (200 OK)

#### GET `/api/enrollments/class/{classGroupId}`
**Response**: `List<EnrollmentResponse>` (200 OK)

#### GET `/api/enrollments/academic-year/{academicYearId}`
**Response**: `List<EnrollmentResponse>` (200 OK)

### ⭐ Endpoints avancés

#### GET `/api/enrollments/student/{studentId}/year/{academicYearId}`
**Response**: `List<EnrollmentResponse>` (200 OK)

#### GET `/api/enrollments/status/{status}`
**Response**: `List<EnrollmentResponse>` (200 OK)

#### GET `/api/enrollments/class/{classGroupId}/count`
**Description**: Compter les inscriptions dans une classe  
**Response**: `Long` (200 OK)

#### PATCH `/api/enrollments/{id}/status`
**Query Params**: `status` (EnrollmentStatus)  
**Response**: `EnrollmentResponse` (200 OK)

#### DELETE `/api/enrollments/{id}`
**Response**: void (204 No Content)

---

## 5. Instructor Service (Port: 9000)

Service de gestion des instructeurs/professeurs.

### 5.1 InstructorController - `/api/instructors`

#### POST `/api/instructors`
**Body**: `InstructorCreateRequest`
**Response**: `InstructorResponse` (201 Created)

#### GET `/api/instructors`
**Response**: `List<InstructorResponse>` (200 OK)

#### GET `/api/instructors/{id}`
**Response**: `InstructorResponse` (200 OK)

#### GET `/api/instructors/user/{userId}`
**Response**: `InstructorResponse` (200 OK)

#### GET `/api/instructors/department/{departmentId}`
**Response**: `List<InstructorResponse>` (200 OK)

#### GET `/api/instructors/status/{status}`
**Response**: `List<InstructorResponse>` (200 OK)

#### PUT `/api/instructors/{id}`
**Body**: `InstructorUpdateRequest`  
**Response**: `InstructorResponse` (200 OK)

#### DELETE `/api/instructors/{id}`
**Response**: void (204 No Content)

---

## 6. Attendance Service (Port: 9000)

Service de gestion des présences avec workflow de validation et système d'appel.

### 6.1 AttendanceController - `/api/attendance`

#### POST `/api/attendance`
**Description**: Enregistrer une présence/absence  
**Body**: `Attendance`
**Response**: `Attendance` (201 Created)

#### GET `/api/attendance`
**Response**: `List<Attendance>` (200 OK)

#### GET `/api/attendance/{id}`
**Response**: `Attendance` (200 OK)

#### GET `/api/attendance/student/{studentId}`
**Response**: `List<Attendance>` (200 OK)

#### GET `/api/attendance/class/{classGroupId}`
**Response**: `List<Attendance>` (200 OK)

#### GET `/api/attendance/date/{date}`
**Path Params**: `date` (LocalDate, ISO format)  
**Response**: `List<Attendance>` (200 OK)

#### GET `/api/attendance/class/{classGroupId}/date/{date}`
**Response**: `List<Attendance>` (200 OK)

#### GET `/api/attendance/student/{studentId}/statistics`
**Description**: Statistiques de présence d'un étudiant  
**Response**: `Map<String, Object>` (200 OK)
```json
{
  "totalSessions": 120,
  "presentCount": 110,
  "absentCount": 7,
  "lateCount": 3,
  "attendanceRate": 91.67,
  "pendingValidations": 2
}
```

#### GET `/api/attendance/student/{studentId}/class/{classGroupId}/rate`
**Description**: Taux de présence  
**Response**: `Double` (200 OK)

#### PUT `/api/attendance/{id}`
**Description**: Mettre à jour une présence  
**Body**: `Attendance`  
**Response**: `Attendance` (200 OK)

#### DELETE `/api/attendance/{id}`
**Response**: void (204 No Content)

### Workflow de justification et validation

#### POST `/api/attendance/{id}/justify`
**Description**: Soumettre une justification (Étudiant)  
**Body**:
```json
{
  "justification": "Medical certificate"
}
```
**Response**: `Attendance` (200 OK)

#### GET `/api/attendance/pending`
**Description**: Absences en attente de validation  
**Query Params**: `classGroupId` (optional), `subjectId` (optional)  
**Response**: `List<Attendance>` (200 OK)

#### PUT `/api/attendance/{id}/validate`
**Description**: Valider/rejeter une absence (Manager)  
**Body**:
```json
{
  "validatedBy": "uuid",
  "decision": "VALIDATED",
  "managerComment": "Certificate verified"
}
```
**Response**: `Map<String, Object>` (200 OK)

### Système d'appel

#### POST `/api/attendance/{id}/appeal`
**Description**: Faire appel d'un rejet (Étudiant)  
**Body**:
```json
{
  "appealReason": "Certificate was authentic",
  "submittedBy": "uuid"
}
```
**Response**: `AppealResponse` (200 OK)

#### GET `/api/attendance/appeals/pending`
**Description**: Appels en attente  
**Response**: `List<AppealResponse>` (200 OK)

#### PUT `/api/attendance/{id}/appeal/review`
**Description**: Examiner un appel (Manager/Admin)  
**Body**:
```json
{
  "reviewedBy": "uuid",
  "decision": "APPROVED",
  "reviewComment": "Certificate is valid"
}
```
**Response**: `AppealResponse` (200 OK)

---

## 7. Messaging Service (Port: 8091)

Service de messagerie interne.

### 7.1 MessageController - `/api/messages`

#### POST `/api/messages`
**Body**: `MessageCreateRequest`
**Response**: `MessageResponse` (201 Created)

#### GET `/api/messages`
**Response**: `List<MessageResponse>` (200 OK)

#### GET `/api/messages/{id}`
**Response**: `MessageResponse` (200 OK)

#### GET `/api/messages/sent/{senderId}`
**Response**: `List<MessageResponse>` (200 OK)

#### GET `/api/messages/received/{receiverId}`
**Response**: `List<MessageResponse>` (200 OK)

#### GET `/api/messages/unread/{receiverId}`
**Response**: `List<MessageResponse>` (200 OK)

#### PATCH `/api/messages/{id}/read`
**Response**: `MessageResponse` (200 OK)

#### DELETE `/api/messages/{id}`
**Response**: void (204 No Content)

---

## 8. Notification Service (Port: 8092)

Service de gestion des notifications.

### 8.1 NotificationController - `/api/notifications`

#### POST `/api/notifications`
**Body**: `NotificationCreateRequest`
**Response**: `NotificationResponse` (201 Created)

#### GET `/api/notifications`
**Response**: `List<NotificationResponse>` (200 OK)

#### GET `/api/notifications/{id}`
**Response**: `NotificationResponse` (200 OK)

#### GET `/api/notifications/user/{userId}`
**Response**: `List<NotificationResponse>` (200 OK)

#### GET `/api/notifications/user/{userId}/unread`
**Response**: `List<NotificationResponse>` (200 OK)

#### GET `/api/notifications/type/{type}`
**Response**: `List<NotificationResponse>` (200 OK)

#### PATCH `/api/notifications/{id}/read`
**Response**: `NotificationResponse` (200 OK)

#### PATCH `/api/notifications/user/{userId}/read-all`
**Description**: Marquer toutes comme lues  
**Response**: void (200 OK)

#### DELETE `/api/notifications/{id}`
**Response**: void (204 No Content)

---

## 9. Report Service (Port: 8093)

Service de génération de rapports (CQRS).

### 9.1 StudentPerformanceReportController - `/api/reports/students`

#### GET `/api/reports/students/{studentId}`
**Description**: Rapport de performance étudiant  
**Response**: `StudentReportProjection` (200 OK)

#### GET `/api/reports/students`
**Response**: `List<StudentReportProjection>` (200 OK)

#### POST `/api/reports/students/refresh`
**Description**: Rafraîchir les projections  
**Response**: void (200 OK)

### 9.2 ClassAnalyticsReportController - `/api/reports/classes`

#### GET `/api/reports/classes/{classGroupId}`
**Description**: Rapport analytique de classe  
**Response**: `ClassReportProjection` (200 OK)

#### GET `/api/reports/classes`
**Response**: `List<ClassReportProjection>` (200 OK)

#### POST `/api/reports/classes/refresh`
**Response**: void (200 OK)

### 9.3 AcademicYearReportController - `/api/reports/years`

#### GET `/api/reports/years/{academicYearId}`
**Response**: `AcademicYearReport` (200 OK)

#### GET `/api/reports/years/{academicYearId}/summary`
**Response**: `Map<String, Object>` (200 OK)

---

## 10. Admin Service (Port: 8094)

Service d'administration et audit du système.

### 10.1 UserManagementController - `/api/admin/users`

#### GET `/api/admin/users`
**Response**: `List<UserDTO>` (200 OK)

#### POST `/api/admin/users`
**Body**: `UserCreateRequest`
**Response**: `UserDTO` (201 Created)

#### PUT `/api/admin/users/{id}`
**Body**: `UserUpdateRequest`  
**Response**: `UserDTO` (200 OK)

#### PATCH `/api/admin/users/{id}/role`
**Query Params**: `role` (string)  
**Response**: `UserDTO` (200 OK)

#### DELETE `/api/admin/users/{id}`
**Response**: void (204 No Content)

### 10.2 AuditLogController - `/api/admin/audit-logs`

#### GET `/api/admin/audit-logs`
**Response**: `List<AuditLog>` (200 OK)

#### GET `/api/admin/audit-logs/user/{userId}`
**Response**: `List<AuditLog>` (200 OK)

#### GET `/api/admin/audit-logs/action/{action}`
**Response**: `List<AuditLog>` (200 OK)

#### GET `/api/admin/audit-logs/date-range`
**Query Params**: `startDate`, `endDate` (LocalDate)  
**Response**: `List<AuditLog>` (200 OK)

### 10.3 SystemConfigController - `/api/admin/config`

#### GET `/api/admin/config`
**Response**: `List<SystemConfig>` (200 OK)

#### GET `/api/admin/config/{key}`
**Response**: `SystemConfig` (200 OK)

#### PUT `/api/admin/config/{key}`
**Body**: `ConfigUpdateRequest`  
**Response**: `SystemConfig` (200 OK)

### 10.4 GlobalNotificationController - `/api/admin/notifications`

#### POST `/api/admin/notifications/broadcast`
**Description**: Envoyer notification globale  
**Body**: `GlobalNotificationRequest`
**Response**: `GlobalNotification` (201 Created)

#### GET `/api/admin/notifications/scheduled`
**Response**: `List<GlobalNotification>` (200 OK)

### 10.5 PermissionController - `/api/admin/permissions`

#### GET `/api/admin/permissions`
**Response**: `List<RolePermission>` (200 OK)

#### GET `/api/admin/permissions/role/{role}`
**Response**: `List<RolePermission>` (200 OK)

#### POST `/api/admin/permissions`
**Body**: `PermissionRequest`
**Response**: `RolePermission` (201 Created)

#### DELETE `/api/admin/permissions/{id}`
**Response**: void (204 No Content)

### 10.6 DashboardController - `/api/admin/dashboard`

#### GET `/api/admin/dashboard/stats`
**Description**: Statistiques globales  
**Response**: `Map<String, Object>` (200 OK)

### 10.7 BackupController - `/api/admin/backup`

#### POST `/api/admin/backup/create`
**Description**: Créer une sauvegarde  
**Response**: `BackupResponse` (201 Created)

#### GET `/api/admin/backup/list`
**Response**: `List<BackupInfo>` (200 OK)

#### POST `/api/admin/backup/restore/{backupId}`
**Response**: `RestoreResponse` (200 OK)

---

## 11. Manager Service (Port: 8095)

Service de gestion des managers académiques.

### 11.1 ManagerController - `/api/managers`

#### POST `/api/managers`
**Body**: `ManagerCreateRequest`
**Response**: `ManagerResponse` (201 Created)

#### GET `/api/managers`
**Response**: `List<ManagerResponse>` (200 OK)

#### GET `/api/managers/{id}`
**Response**: `ManagerResponse` (200 OK)

#### GET `/api/managers/user/{userId}`
**Response**: `ManagerResponse` (200 OK)

#### GET `/api/managers/level/{level}`
**Description**: Filtrer par niveau (HEAD_OF_DEPARTMENT, ACADEMIC_DIRECTOR, etc.)  
**Response**: `List<ManagerResponse>` (200 OK)

#### PUT `/api/managers/{id}`
**Body**: `ManagerUpdateRequest`  
**Response**: `ManagerResponse` (200 OK)

#### DELETE `/api/managers/{id}`
**Response**: void (204 No Content)

### 11.2 ManagerAssignmentController - `/api/manager-assignments`

#### POST `/api/manager-assignments`
**Body**: `AssignmentCreateRequest`
**Response**: `AssignmentResponse` (201 Created)

#### GET `/api/manager-assignments`
**Response**: `List<AssignmentResponse>` (200 OK)

#### GET `/api/manager-assignments/manager/{managerId}`
**Response**: `List<AssignmentResponse>` (200 OK)

#### GET `/api/manager-assignments/active`
**Response**: `List<AssignmentResponse>` (200 OK)

#### DELETE `/api/manager-assignments/{id}`
**Response**: void (204 No Content)

### 11.3 ManagerResponsibilityController - `/api/manager-responsibilities`

#### POST `/api/manager-responsibilities`
**Body**: `ResponsibilityCreateRequest`
**Response**: `ResponsibilityResponse` (201 Created)

#### GET `/api/manager-responsibilities/manager/{managerId}`
**Response**: `List<ResponsibilityResponse>` (200 OK)

#### PUT `/api/manager-responsibilities/{id}/permissions`
**Body**: `PermissionUpdateRequest`  
**Response**: `ResponsibilityResponse` (200 OK)

### 11.4 ManagerActionController - `/api/manager-actions`

#### GET `/api/manager-actions/manager/{managerId}`
**Description**: Actions d'un manager (audit)  
**Response**: `List<ManagerAction>` (200 OK)

#### GET `/api/manager-actions/type/{actionType}`
**Response**: `List<ManagerAction>` (200 OK)

### 11.5 ValidationController - `/api/validations`

#### GET `/api/validations/pending`
**Description**: Liste des validations en attente  
**Response**: `Map<String, List<?>>` (200 OK)

#### POST `/api/validations/grade`
**Description**: Valider une note  
**Body**: `GradeValidationRequest`
**Response**: void (200 OK)

#### POST `/api/validations/enrollment`
**Description**: Valider une inscription  
**Body**: `EnrollmentValidationRequest`
**Response**: void (200 OK)

---

## 📊 Résumé des Endpoints

| Service | Controllers | Total Endpoints | Port |
|---------|-------------|-----------------|------|
| Identity Service | 2 | ~15 | 9000 |
| Academic Year Service | 2 | ~16 | 9000 |
| Academic Structure Service | 6 | ~42 | 9000 |
| Student Service | 2 | ~28 | 9000 |
| Instructor Service | 1 | ~8 | 9000 |
| Attendance Service | 1 | ~18 | 9000 |
| Messaging Service | 1 | ~8 | 8091 |
| Notification Service | 1 | ~10 | 8092 |
| Report Service | 3 | ~10 | 8093 |
| Admin Service | 10 | ~35 | 8094 |
| Manager Service | 5 | ~20 | 8095 |
| **TOTAL** | **35** | **~210** | - |

---

## 🔐 Authentification

Tous les endpoints (sauf `/api/auth/login` et `/api/auth/register`) nécessitent un token JWT dans le header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 OK | Requête réussie |
| 201 Created | Ressource créée |
| 204 No Content | Suppression réussie |
| 400 Bad Request | Données invalides |
| 401 Unauthorized | Non authentifié |
| 403 Forbidden | Non autorisé |
| 404 Not Found | Ressource introuvable |
| 409 Conflict | Conflit (ex: duplication) |
| 500 Internal Server Error | Erreur serveur |

## 🌟 Fonctionnalités avancées

### Caching
- **Session Service**: Cache Caffeine pour emplois du temps hebdomadaires
- Eviction automatique lors de modifications

### Resilience
- **Circuit Breaker**: Protection contre défaillances services externes
- **Fallback**: Dégradation gracieuse

### Performance
- **Batch Fetching**: Récupération groupée (ex: instructeurs dans SessionService)
- **Lazy Loading**: Relations JPA optimisées

### Validation
- Jakarta Bean Validation sur tous les DTO
- `@Valid` dans les controllers

---

**Dernière mise à jour**: 25 janvier 2026  
**Version**: 1.0.0
