# API Documentation Complète - Microservices

**Date:** 25 janvier 2026  
**Version:** 1.0.0  
**Services:** 11 microservices  
**Total Controllers:** 35 controllers  
**Total Endpoints:** ~210 endpoints  

---

## 📊 Vue d'ensemble des Services

| Service | Controllers | Endpoints | Port | Base URL |
|---------|-------------|-----------|------|----------|
| **Identity Service** | 2 | ~15 | 8084 | `http://localhost:8084` |
| **Academic Year Service** | 2 | ~16 | 8085 | `http://localhost:8085` |
| **Academic Structure Service** | 6 | ~42 | 8087 | `http://localhost:8087` |
| **Student Service** | 2 | ~28 | 8086 | `http://localhost:8086` |
| **Instructor Service** | 1 | ~8 | 8088 | `http://localhost:8088` |
| **Attendance Service** | 1 | ~18 | 8090 | `http://localhost:8090` |
| **Messaging Service** | 1 | ~8 | 8091 | `http://localhost:8091` |
| **Notification Service** | 1 | ~10 | 8092 | `http://localhost:8092` |
| **Report Service** | 3 | ~10 | 8093 | `http://localhost:8093` |
| **Admin Service** | 10 | ~35 | 8094 | `http://localhost:8094` |
| **Manager Service** | 5 | ~20 | 8095 | `http://localhost:8095` |

---

## 1. 🔐 Identity Service (Port: 8084)

Service d'authentification et gestion des identités avec JWT.

### 1.1 AuthController - `/api/auth`

#### POST `/api/auth/login`
**Description:** Authentification utilisateur

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGci...",
  "type": "Bearer",
  "username": "john.doe",
  "roles": ["ROLE_STUDENT"]
}
```

#### POST `/api/auth/register`
**Description:** Créer un nouveau compte

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "roles": ["ROLE_STUDENT"]
}
```

#### GET `/api/auth/validate`
**Description:** Valider un token JWT  
**Query Params:** `token` (string)  
**Response:** `boolean`

---

### 1.2 UserController - `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Liste tous les utilisateurs |
| GET | `/api/users/{id}` | Obtenir un utilisateur par ID |
| GET | `/api/users/username/{username}` | Rechercher par username |
| GET | `/api/users/email/{email}` | Rechercher par email |
| GET | `/api/users/role/{role}` | Obtenir utilisateurs par rôle (ADMIN, MANAGER, INSTRUCTOR, STUDENT) |
| PUT | `/api/users/{id}/enable` | Activer un utilisateur |
| PUT | `/api/users/{id}/disable` | Désactiver un utilisateur |
| PUT | `/api/users/{id}/change-password` | Changer le mot de passe (Query: `newPassword`) |
| DELETE | `/api/users/{id}` | Supprimer un utilisateur |

---

## 2. 📅 Academic Year Service (Port: 8085)

### 2.1 AcademicYearController - `/api/academic-years`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/academic-years` | Créer une année académique |
| GET | `/api/academic-years` | Liste toutes les années |
| GET | `/api/academic-years/{id}` | Obtenir par ID |
| GET | `/api/academic-years/active` | Année académique active |
| GET | `/api/academic-years/status/{status}` | Filtrer par statut (ACTIVE, COMPLETED, ARCHIVED) |
| PUT | `/api/academic-years/{id}` | Mettre à jour |
| PATCH | `/api/academic-years/{id}/status` | Changer le statut (Query: `status`) |
| DELETE | `/api/academic-years/{id}` | Supprimer |

### 2.2 SemesterController - `/api/semesters`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/semesters` | Créer un semestre |
| GET | `/api/semesters` | Liste tous les semestres |
| GET | `/api/semesters/{id}` | Obtenir par ID |
| GET | `/api/semesters/year/{academicYearId}` | Semestres par année académique |
| PUT | `/api/semesters/{id}` | Mettre à jour |
| DELETE | `/api/semesters/{id}` | Supprimer |

---

## 3. 🏫 Academic Structure Service (Port: 8087)

### 3.1 DepartmentController - `/api/departments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/departments` | Créer un département |
| GET | `/api/departments` | Liste tous les départements |
| GET | `/api/departments/{id}` | Obtenir par ID |
| GET | `/api/departments/code/{code}` | Obtenir par code |
| PUT | `/api/departments/{id}` | Mettre à jour |
| DELETE | `/api/departments/{id}` | Supprimer |

### 3.2 ClassGroupController - `/api/class-groups`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/class-groups` | Créer une classe |
| GET | `/api/class-groups` | Liste toutes les classes |
| GET | `/api/class-groups/{id}` | Obtenir par ID |
| PUT | `/api/class-groups/{id}` | Mettre à jour |
| DELETE | `/api/class-groups/{id}` | Supprimer |

### 3.3 ModuleController - `/api/modules`
### 3.4 SubjectController - `/api/subjects`
### 3.5 SubjectOfferingController - `/api/subject-offerings`

*Standard CRUD operations for each*

### 3.6 SessionController ⭐ - `/api/sessions`

**Key Endpoints:**

#### POST `/api/sessions`
```json
{
  "subjectOfferingId": "uuid",
  "date": "2026-01-25T10:00:00",
  "room": "Amphi A",
  "status": "SCHEDULED"
}
```

#### GET `/api/sessions/classgroup/{classGroupId}/week/grouped` 🔥
**Description:** Emploi du temps groupé par jour (avec cache)  
**Query Params:** `date` (optional, LocalDate)

**Response:**
```json
{
  "2026-01-27": [...],
  "2026-01-28": [...],
  "2026-01-29": [...]
}
```

**Features:**
- ✅ Cache Caffeine
- ✅ Circuit Breaker pour instructor-service
- ✅ Batch fetching des instructeurs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Créer une session |
| GET | `/api/sessions` | Liste toutes les sessions |
| GET | `/api/sessions/{id}` | Obtenir par ID |
| GET | `/api/sessions/classgroup/{classGroupId}/week` | Emploi du temps hebdomadaire |
| PUT | `/api/sessions/{id}` | Mettre à jour |
| DELETE | `/api/sessions/{id}` | Supprimer |

---

## 4. 🎓 Student Service (Port: 8086)

### 4.1 StudentController - `/api/students`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students` | Créer un étudiant |
| GET | `/api/students` | Liste tous les étudiants |
| GET | `/api/students/{id}` | Obtenir par ID |
| GET | `/api/students/number/{studentNumber}` | Recherche par numéro étudiant |
| GET | `/api/students/email/{email}` | Rechercher par email |
| GET | `/api/students/user/{userId}` | Obtenir par user ID |
| GET | `/api/students/status/{status}` | Filtrer par statut (ACTIVE, INACTIVE, GRADUATED, SUSPENDED) |
| GET | `/api/students/search` | Recherche (Query: `query`) |
| PUT | `/api/students/{id}` | Mettre à jour |
| PATCH | `/api/students/{id}/status` | Changer statut |
| DELETE | `/api/students/{id}` | Supprimer |

### 4.2 StudentEnrollmentController - `/api/enrollments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enrollments` | Créer une inscription |
| GET | `/api/enrollments` | Liste toutes les inscriptions |
| GET | `/api/enrollments/{id}` | Obtenir par ID |
| GET | `/api/enrollments/student/{studentId}` | Inscriptions d'un étudiant |
| GET | `/api/enrollments/class/{classGroupId}` | Inscriptions d'une classe |
| GET | `/api/enrollments/academic-year/{academicYearId}` | Par année académique |
| GET | `/api/enrollments/student/{studentId}/year/{academicYearId}` | Étudiant + Année |
| GET | `/api/enrollments/status/{status}` | Par statut |
| GET | `/api/enrollments/class/{classGroupId}/count` | Compter inscriptions |
| PATCH | `/api/enrollments/{id}/status` | Changer statut |
| DELETE | `/api/enrollments/{id}` | Supprimer |

---

## 5. 👨‍🏫 Instructor Service (Port: 8088)

### 5.1 InstructorController - `/api/instructors`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/instructors` | Créer un instructeur |
| GET | `/api/instructors` | Liste tous les instructeurs |
| GET | `/api/instructors/{id}` | Obtenir par ID |
| GET | `/api/instructors/user/{userId}` | Obtenir par user ID |
| GET | `/api/instructors/department/{departmentId}` | Par département |
| GET | `/api/instructors/status/{status}` | Par statut |
| PUT | `/api/instructors/{id}` | Mettre à jour |
| DELETE | `/api/instructors/{id}` | Supprimer |

---

## 6. ✅ Attendance Service (Port: 8090)

### 6.1 AttendanceController - `/api/attendance`

#### Endpoints Basiques

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance` | Enregistrer présence/absence |
| GET | `/api/attendance` | Liste toutes les présences |
| GET | `/api/attendance/{id}` | Obtenir par ID |
| GET | `/api/attendance/student/{studentId}` | Présences d'un étudiant |
| GET | `/api/attendance/class/{classGroupId}` | Présences d'une classe |
| GET | `/api/attendance/date/{date}` | Par date (ISO format) |
| GET | `/api/attendance/class/{classGroupId}/date/{date}` | Classe + Date |
| PUT | `/api/attendance/{id}` | Mettre à jour |
| DELETE | `/api/attendance/{id}` | Supprimer |

#### Statistiques

**GET** `/api/attendance/student/{studentId}/statistics`

**Response:**
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

**GET** `/api/attendance/student/{studentId}/class/{classGroupId}/rate`  
**Response:** `Double` (taux de présence)

#### Workflow de Justification

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/{id}/justify` | Soumettre justification (Étudiant) |
| GET | `/api/attendance/pending` | Absences en attente de validation |
| PUT | `/api/attendance/{id}/validate` | Valider/rejeter absence (Manager) |

**Justify Request:**
```json
{
  "justification": "Medical certificate"
}
```

**Validate Request:**
```json
{
  "validatedBy": "uuid",
  "decision": "VALIDATED",
  "managerComment": "Certificate verified"
}
```

#### Système d'Appel

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/{id}/appeal` | Faire appel d'un rejet |
| GET | `/api/attendance/appeals/pending` | Appels en attente |
| PUT | `/api/attendance/{id}/appeal/review` | Examiner un appel |

**Appeal Request:**
```json
{
  "appealReason": "Certificate was authentic",
  "submittedBy": "uuid"
}
```

**Review Request:**
```json
{
  "reviewedBy": "uuid",
  "decision": "APPROVED",
  "reviewComment": "Certificate is valid"
}
```

---

## 7. 💬 Messaging Service (Port: 8091)

### 7.1 MessageController - `/api/messages`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Créer un message |
| GET | `/api/messages` | Liste tous les messages |
| GET | `/api/messages/{id}` | Obtenir par ID |
| GET | `/api/messages/sent/{senderId}` | Messages envoyés |
| GET | `/api/messages/received/{receiverId}` | Messages reçus |
| GET | `/api/messages/unread/{receiverId}` | Messages non lus |
| PATCH | `/api/messages/{id}/read` | Marquer comme lu |
| DELETE | `/api/messages/{id}` | Supprimer |

---

## 8. 🔔 Notification Service (Port: 8092)

### 8.1 NotificationController - `/api/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications` | Créer une notification |
| GET | `/api/notifications` | Liste toutes les notifications |
| GET | `/api/notifications/{id}` | Obtenir par ID |
| GET | `/api/notifications/user/{userId}` | Notifications d'un utilisateur |
| GET | `/api/notifications/user/{userId}/unread` | Non lues |
| GET | `/api/notifications/type/{type}` | Par type |
| PATCH | `/api/notifications/{id}/read` | Marquer comme lue |
| PATCH | `/api/notifications/user/{userId}/read-all` | Tout marquer comme lu |
| DELETE | `/api/notifications/{id}` | Supprimer |

---

## 9. 📊 Report Service (Port: 8093)

Service CQRS de génération de rapports.

### 9.1 StudentPerformanceReportController - `/api/reports/students`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/students/{studentId}` | Rapport de performance |
| GET | `/api/reports/students` | Tous les rapports |
| POST | `/api/reports/students/refresh` | Rafraîchir projections |

### 9.2 ClassAnalyticsReportController - `/api/reports/classes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/classes/{classGroupId}` | Rapport analytique classe |
| GET | `/api/reports/classes` | Tous les rapports |
| POST | `/api/reports/classes/refresh` | Rafraîchir projections |

### 9.3 AcademicYearReportController - `/api/reports/years`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/years/{academicYearId}` | Rapport année académique |
| GET | `/api/reports/years/{academicYearId}/summary` | Résumé |

---

## 10. 👑 Admin Service (Port: 8094)

### 10.1 UserManagementController - `/api/admin/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Liste utilisateurs |
| POST | `/api/admin/users` | Créer utilisateur |
| PUT | `/api/admin/users/{id}` | Mettre à jour |
| PATCH | `/api/admin/users/{id}/role` | Changer rôle |
| DELETE | `/api/admin/users/{id}` | Supprimer |

### 10.2 AuditLogController - `/api/admin/audit-logs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/audit-logs` | Tous les logs |
| GET | `/api/admin/audit-logs/user/{userId}` | Par utilisateur |
| GET | `/api/admin/audit-logs/action/{action}` | Par action |
| GET | `/api/admin/audit-logs/date-range` | Par période (Query: `startDate`, `endDate`) |

### 10.3 SystemConfigController - `/api/admin/config`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/config` | Toutes les configs |
| GET | `/api/admin/config/{key}` | Config par clé |
| PUT | `/api/admin/config/{key}` | Mettre à jour |

### 10.4 GlobalNotificationController - `/api/admin/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/notifications/broadcast` | Notification globale |
| GET | `/api/admin/notifications/scheduled` | Notifications planifiées |

### 10.5 PermissionController - `/api/admin/permissions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/permissions` | Toutes les permissions |
| GET | `/api/admin/permissions/role/{role}` | Par rôle |
| POST | `/api/admin/permissions` | Créer permission |
| DELETE | `/api/admin/permissions/{id}` | Supprimer |

### 10.6 DashboardController - `/api/admin/dashboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Statistiques globales |

### 10.7 BackupController - `/api/admin/backup`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/backup/create` | Créer sauvegarde |
| GET | `/api/admin/backup/list` | Liste sauvegardes |
| POST | `/api/admin/backup/restore/{backupId}` | Restaurer |

---

## 11. 📋 Manager Service (Port: 8095)

### 11.1 ManagerController - `/api/managers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/managers` | Créer un manager |
| GET | `/api/managers` | Liste managers |
| GET | `/api/managers/{id}` | Obtenir par ID |
| GET | `/api/managers/user/{userId}` | Par user ID |
| GET | `/api/managers/level/{level}` | Par niveau (HEAD_OF_DEPARTMENT, ACADEMIC_DIRECTOR, etc.) |
| PUT | `/api/managers/{id}` | Mettre à jour |
| DELETE | `/api/managers/{id}` | Supprimer |

### 11.2 ManagerAssignmentController - `/api/manager-assignments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/manager-assignments` | Créer affectation |
| GET | `/api/manager-assignments` | Toutes affectations |
| GET | `/api/manager-assignments/manager/{managerId}` | Par manager |
| GET | `/api/manager-assignments/active` | Affectations actives |
| DELETE | `/api/manager-assignments/{id}` | Supprimer |

### 11.3 ManagerResponsibilityController - `/api/manager-responsibilities`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/manager-responsibilities` | Créer responsabilité |
| GET | `/api/manager-responsibilities/manager/{managerId}` | Par manager |
| PUT | `/api/manager-responsibilities/{id}/permissions` | Mettre à jour permissions |

### 11.4 ManagerActionController - `/api/manager-actions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manager-actions/manager/{managerId}` | Actions d'un manager |
| GET | `/api/manager-actions/type/{actionType}` | Par type d'action |

### 11.5 ValidationController - `/api/validations`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/validations/pending` | Validations en attente |
| POST | `/api/validations/grade` | Valider une note |
| POST | `/api/validations/enrollment` | Valider une inscription |

---

## 🔐 Authentification

**Header requis pour tous les endpoints (sauf login/register):**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Codes de Statut HTTP

| Code | Description |
|------|-------------|
| 200 OK | Requête réussie |
| 201 Created | Ressource créée |
| 204 No Content | Suppression réussie |
| 400 Bad Request | Données invalides |
| 401 Unauthorized | Non authentifié |
| 403 Forbidden | Non autorisé |
| 404 Not Found | Ressource introuvable |
| 409 Conflict | Conflit (duplication) |
| 500 Internal Server Error | Erreur serveur |

---

## 🌟 Fonctionnalités Avancées

### Caching
- **Session Service:** Cache Caffeine pour emplois du temps
- Eviction automatique lors de modifications

### Resilience
- **Circuit Breaker:** Protection contre défaillances
- **Fallback:** Dégradation gracieuse

### Performance
- **Batch Fetching:** Récupération groupée
- **Lazy Loading:** Relations JPA optimisées

### Validation
- Jakarta Bean Validation sur tous les DTO
- `@Valid` dans les controllers

---

**Dernière mise à jour:** 25 janvier 2026  
**Version:** 1.0.0  
**Total Endpoints:** ~210
