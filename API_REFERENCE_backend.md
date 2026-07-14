# API Reference

Documentation exhaustive de tous les endpoints REST exposés par le système (4 services : `identity-service`, `education-core-service`, `communication-hub-service`, `api-gateway`).

Générée à partir d'une inspection directe du code source (contrôleurs, DTOs, `application.yml`) le 2026-07-13, pour la branche `fix/critical-audit-r1-r3`.

Chaque endpoint qui produit un corps de réponse non trivial est accompagné d'un exemple JSON. Les UUID d'exemple sont des valeurs fictives fixes (`11111111-...` à `ffffffff-...`) réutilisées de façon cohérente au sein d'une même section pour faciliter la lecture — elles n'ont aucune signification en dehors de ce document.

---

## 0. Conventions

### 0.1 Ports

Les ports par défaut dans les `application.yml` de chaque service sont parfois **surchargés par `docker-compose.yml`**. En environnement Docker Compose (le mode d'exécution recommandé), utilisez la colonne "Docker Compose" :

| Service | Port `application.yml` | Port Docker Compose | Package racine |
|---|---|---|---|
| `identity-service` | 8084 | **8084** | `com.sms.identity` |
| `education-core-service` | 8097 | **8085** | `com.core.school` |
| `communication-hub-service` | 8096 | **8091** | `com.core.school.communicationhub` |
| `api-gateway` | 9000 | **8080** | — |

En usage normal, les clients ne parlent **qu'à la gateway** (port 8080). Les ports directs de service ne sont utiles qu'en debug local ou pour les endpoints Actuator (non routés par la gateway, voir §0.4).

### 0.2 Authentification

- Toutes les routes protégées attendent un header `Authorization: Bearer <JWT>`.
- Le JWT est émis par `POST /api/auth/login` (identity-service) et vérifié par un filtre JWT (HS256, secret partagé `JWT_SECRET`) à la fois par la gateway et par chaque service métier.
- Le header interne `X-Internal-Api-Key` (service-à-service uniquement) est systématiquement supprimé par la gateway sur tout trafic entrant externe (`RemoveRequestHeader=X-Internal-Api-Key`) — il ne peut donc jamais être fourni par un client externe.

### 0.3 Matrice de contrôle d'accès (rôles) — vue gateway

| Préfixe de route | Rôles autorisés |
|---|---|
| `/api/auth/**` | public (aucune authentification) |
| `/api/education-core/**` (health) | public |
| `/api/users/**` | `ADMIN` |
| `/api/admin/**` | `ADMIN` |
| `/api/audit-logs/**` | `ADMIN` |
| `/api/discipline/**` | `ADMIN`, `MANAGER` |
| `/api/validations/**` | `ADMIN`, `MANAGER` |
| `/api/managers/**`, `/api/manager-assignments/**`, `/api/manager-responsibilities/**`, `/api/manager-actions/**` | `ADMIN`, `MANAGER` |
| `/api/academic-years/**`, `/api/semesters/**` | tout rôle authentifié |
| `/api/departments/**`, `/api/class-groups/**`, `/api/modules/**`, `/api/subjects/**`, `/api/subject-offerings/**`, `/api/sessions/**` | tout rôle authentifié |
| `/api/students/**`, `/api/enrollments/**` | tout rôle authentifié |
| `/api/instructors/**` | tout rôle authentifié |
| `/api/grades/**` | tout rôle authentifié |
| `/api/attendance/**` | tout rôle authentifié |
| `/api/messages/**` | tout rôle authentifié |
| `/api/notifications/**` | tout rôle authentifié |
| `/api/reports/**` | tout rôle authentifié |

L'autorisation fine par rôle métier (ex : un `STUDENT` ne devrait voir que ses propres notes) n'est **pas** appliquée au niveau gateway pour les routes "tout rôle authentifié" — elle doit être vérifiée au niveau service le cas échéant. Consultez le code de chaque contrôleur pour le détail.

### 0.4 Endpoints Actuator

Chaque service expose `/actuator/health`, `/actuator/info`, `/actuator/metrics` **en direct sur son propre port** (8084/8085/8091). **Aucun de ces endpoints n'est routé par la gateway.**

Exemple de réponse `GET /actuator/health` :

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "PostgreSQL" } },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" }
  }
}
```

### 0.5 Pagination optionnelle

Sur les listes qui la supportent (voir tableau par domaine), la pagination est **opt-in** :
- Si `page` **et** `size` sont tous deux fournis en query params → réponse enveloppée :

```json
{
  "content": [ /* éléments de la page */ ],
  "totalPages": 4,
  "totalElements": 76,
  "number": 0
}
```

- Si l'un des deux (ou les deux) est omis → réponse en tableau JSON brut (comportement historique, sans pagination) :

```json
[ /* tous les éléments, sans enveloppe */ ]
```

Les endpoints qui renvoient nativement un `Page<T>` Spring Data (audit-logs, discipline) suivent le format Spring standard : `{"content":[...], "totalPages":n, "totalElements":n, "number":n, "size":n, "first":bool, "last":bool, ...}`.

### 0.6 Format d'erreur

Deux `@RestControllerAdvice` gèrent les erreurs (un dans identity-service, un dans `education-core-service.common`) :

```json
{
  "timestamp": "2026-07-13T10:15:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email': must be a well-formed email address",
  "path": "/api/students"
}
```

Mapping des exceptions → statuts (education-core-service, `common.api.GlobalExceptionHandler`) :
- `MethodArgumentNotValidException` → 400 (avec map des erreurs de champ)
- `IllegalArgumentException` → 404 si le message contient "not found" (insensible à la casse), sinon 400
- `IllegalStateException` → 409 (conflit métier)
- `DataIntegrityViolationException` → 409
- `ResponseStatusException` → statut propagé
- `Exception` générique → 500

identity-service (`GlobalExceptionHandler`) : `InvalidCredentialsException` → 401, `AccountDisabledException` → 403, `RegistrationForbiddenException` → 403, erreurs de validation/parsing → 400, générique → 500.

---

## 1. identity-service

### 1.1 AuthController — `/api/auth` (public via gateway)

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/auth/login` | `@Valid @RequestBody LoginRequest` | `LoginResponse` | 200 |
| POST | `/api/auth/register` | `@Valid @RequestBody RegisterRequest`, header `X-Internal-Api-Key` (optionnel, interne uniquement) | `UserDTO` | 200 |
| GET | `/api/auth/validate` | `token` (query, requis) | `Boolean` | 200 |
| POST | `/api/auth/refresh` | header `Authorization` (optionnel), body `Map<String,String>` (optionnel) | `LoginResponse` | 200 |
| POST | `/api/auth/logout` | — | `{"message":"Logout successful"}` | 200 |
| POST | `/api/auth/change-password` | `@Valid @RequestBody ChangePasswordRequest` | `Map<String,String>` | 200 |

**Sécurité `register`** : le rôle demandé (`STUDENT`/`INSTRUCTOR`/`MANAGER`/`ADMIN`) n'est honoré que si `X-Internal-Api-Key` correspond à la clé configurée (`internal.api.key`). Comme la gateway retire ce header pour tout appel externe, l'inscription publique via la gateway ne peut créer que des comptes `STUDENT`.

**`POST /api/auth/login`** — requête :
```json
{ "username": "jdupont", "email": null, "password": "S3cur3P@ss!" }
```
réponse `200` :
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": "99999999-9999-9999-9999-999999999999",
  "username": "jdupont",
  "email": "jdupont@example.com",
  "role": "STUDENT",
  "mustChangePassword": false
}
```

**`POST /api/auth/register`** — requête :
```json
{
  "username": "jdupont",
  "email": "jdupont@example.com",
  "password": "S3cur3P@ss!",
  "firstname": "Jean",
  "lastname": "Dupont",
  "role": "STUDENT"
}
```
réponse `200` :
```json
{
  "id": "99999999-9999-9999-9999-999999999999",
  "username": "jdupont",
  "email": "jdupont@example.com",
  "firstname": "Jean",
  "lastname": "Dupont",
  "role": "STUDENT",
  "enabled": true,
  "createdAt": "2026-07-13T10:00:00",
  "updatedAt": "2026-07-13T10:00:00"
}
```

**`GET /api/auth/validate?token=...`** — réponse `200` : `true` (ou `false`), corps brut `Boolean`, pas d'enveloppe JSON objet.

**`POST /api/auth/refresh`** — réponse `200` : même forme que `LoginResponse` (voir login) avec un `token` renouvelé.

**`POST /api/auth/logout`** — réponse `200` :
```json
{ "message": "Logout successful" }
```

**`POST /api/auth/change-password`** — requête :
```json
{
  "userId": "99999999-9999-9999-9999-999999999999",
  "currentPassword": "OldP@ss1",
  "newPassword": "NewP@ss2!"
}
```
réponse `200` :
```json
{ "message": "Password changed successfully" }
```

### 1.2 UserController — `/api/users` (rôle `ADMIN` uniquement)

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| GET | `/api/users` | — | `List<UserDTO>` | 200 |
| POST | `/api/users` | `@Valid @RequestBody RegisterRequest` | `UserDTO` | 200 |
| GET | `/api/users/{id}` | `id: UUID` | `UserDTO` | 200 |
| GET | `/api/users/username/{username}` | `username: String` | `UserDTO` | 200 |
| GET | `/api/users/email/{email}` | `email: String` | `UserDTO` | 200 |
| GET | `/api/users/role/{role}` | `role: UserRole` | `List<UserDTO>` | 200 |
| PUT | `/api/users/{id}` | `id: UUID`, body `Map<String,String>` (`role`,`username`,`email`,`firstname`,`lastname`) | `UserDTO` | 200 |
| PUT | `/api/users/{id}/enable` | `id: UUID` | — | 200 |
| PUT | `/api/users/{id}/disable` | `id: UUID` | — | 200 |
| PUT | `/api/users/{id}/change-password` | `id: UUID`, `newPassword` (query, requis) | — | 200 — reset admin sans vérification du mot de passe courant |
| DELETE | `/api/users/{id}` | `id: UUID` | — | **200** (pas 204, incohérent avec le reste du système) |
| GET | `/api/users/admin/stats` | — | `Map<String,Object>` | 200 |

`UserDTO` (réponse type) :
```json
{
  "id": "99999999-9999-9999-9999-999999999999",
  "username": "jdupont",
  "email": "jdupont@example.com",
  "firstname": "Jean",
  "lastname": "Dupont",
  "role": "STUDENT",
  "enabled": true,
  "createdAt": "2026-07-13T10:00:00",
  "updatedAt": "2026-07-13T10:00:00"
}
```

`GET /api/users` — réponse `200` : `[ <UserDTO>, <UserDTO>, ... ]`

`PUT /api/users/{id}` — requête :
```json
{ "role": "INSTRUCTOR", "username": "jdupont", "email": "jdupont@example.com", "firstname": "Jean", "lastname": "Dupont" }
```

`GET /api/users/admin/stats` — réponse `200` :
```json
{ "totalUsers": 128, "admins": 2, "managers": 5, "instructors": 21, "students": 100, "enabled": 120, "disabled": 8 }
```
*(clés exactes dépendantes de l'implémentation — structure indicative)*

### 1.3 DTOs

- **`LoginRequest`** : `username:String`, `email:String @Email`, `password:String @NotBlank`
- **`RegisterRequest`** : `username:String @NotBlank @Size(3,100)`, `email:String @NotBlank @Email`, `password:String @NotBlank @Size(min=6)`, `firstname`, `lastname:String`, `role:UserRole` (défaut `STUDENT`)
- **`ChangePasswordRequest`** : `userId:UUID` (⚠ annoté `@NotBlank`, incohérent sur un UUID), `currentPassword:String @NotBlank`, `newPassword:String @NotBlank @Size(min=8)`
- **`LoginResponse`** : `token`, `type` (défaut `"Bearer"`), `userId`, `username`, `email`, `role:String`, `mustChangePassword:boolean`
- **`UserDTO`** : `id`, `username`, `email`, `firstname`, `lastname`, `role:UserRole`, `enabled:Boolean`, `createdAt`, `updatedAt`
- **`ApiErrorResponse`** : `timestamp:Instant`, `status:int`, `error,message:String`, `path:String`

**Enum `User.UserRole`** : `ADMIN`, `MANAGER`, `INSTRUCTOR`, `STUDENT`

---

## 2. education-core-service

### 2.1 Academic Years — `/api/academic-years`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/academic-years` | `@Valid AcademicYearRequest` | `AcademicYearResponse` | 201 |
| GET | `/api/academic-years` | `page`,`size` (optionnels) | liste / page | 200 |
| GET | `/api/academic-years/{id}` | `id:UUID` | `AcademicYearResponse` | 200/404 |
| POST | `/api/academic-years/{id}/semesters` | `id:UUID`, `@Valid SemesterRequest` | `AcademicYearResponse` | 200 |
| PUT | `/api/academic-years/{id}` | `id:UUID`, `@Valid AcademicYearRequest` | `AcademicYearResponse` | 200 |
| PUT | `/api/academic-years/{id}/activate` | `id:UUID` | `AcademicYearResponse` | 200 |
| DELETE | `/api/academic-years/{id}` | `id:UUID` | — | 204 |

`AcademicYearRequest` :
```json
{ "code": "2026-2027", "startDate": "2026-09-01", "endDate": "2027-06-30" }
```
`AcademicYearResponse` :
```json
{
  "id": "aaaaaaaa-0000-0000-0000-000000000001",
  "code": "2026-2027",
  "startDate": "2026-09-01",
  "endDate": "2027-06-30",
  "status": "ACTIVE",
  "semesters": [
    { "id": "aaaaaaaa-0000-0000-0000-000000000002", "name": "Semestre 1", "startDate": "2026-09-01", "endDate": "2027-01-31" }
  ]
}
```
`SemesterRequest` :
```json
{ "name": "Semestre 2", "startDate": "2027-02-01", "endDate": "2027-06-30" }
```

> ⚠ La gateway route aussi `/api/semesters/**` vers ce service, mais aucun endpoint racine `/api/semesters` n'existe — les semestres ne sont accessibles qu'en sous-ressource ci-dessus.

### 2.2 Admin — `/api/admin` (rôle `ADMIN`)

| Méthode | Chemin | Retour | Statut |
|---|---|---|---|
| GET | `/api/admin/stats` | `Map<String,Object>` | 200 |

Réponse :
```json
{
  "studentsCount": 480,
  "instructorsCount": 32,
  "classGroupsCount": 18,
  "sessionsCount": 640,
  "attendanceRecordsCount": 24500,
  "validationDecisionsCount": 312,
  "generatedAt": "2026-07-13T10:00:00Z"
}
```

### 2.3 Attendance — `/api/attendance`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/attendance` | `@Valid AttendanceRequest` | `AttendanceResponse` | 201 |
| PATCH | `/api/attendance/{id}/status` | `id:UUID`, `@Valid AttendanceStatusUpdateRequest` | `AttendanceResponse` | 200 |
| GET | `/api/attendance` | `studentId`,`sessionId`,`date` (optionnels) | `List<AttendanceResponse>` | 200 |
| GET | `/api/attendance/{id}` | `id:UUID` | `AttendanceResponse` | 200/404 |
| GET | `/api/attendance/session/{sessionId}` | `sessionId:UUID` | `List<AttendanceResponse>` | 200 |
| GET | `/api/attendance/students/{studentId}` | `studentId:UUID` | `List<AttendanceResponse>` | 200 |
| POST | `/api/attendance/initialize/{sessionId}` | `sessionId:UUID` | `AttendanceInitializationResponse` | 200 |
| PATCH / PUT | `/api/attendance/bulk-update` | `@Valid BulkAttendanceUpdateRequest` | `List<AttendanceResponse>` | 200 |

`AttendanceRequest` :
```json
{
  "studentId": "11111111-1111-1111-1111-111111111111",
  "sessionId": "77777777-7777-7777-7777-777777777777",
  "classGroupId": "55555555-5555-5555-5555-555555555555",
  "attendanceDate": "2026-07-13",
  "status": "PRESENT"
}
```
`AttendanceResponse` :
```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "studentId": "11111111-1111-1111-1111-111111111111",
  "sessionId": "77777777-7777-7777-7777-777777777777",
  "classGroupId": "55555555-5555-5555-5555-555555555555",
  "attendanceDate": "2026-07-13",
  "status": "PRESENT",
  "updatedAt": "2026-07-13T09:05:00Z"
}
```
`AttendanceStatusUpdateRequest` : `{ "status": "LATE" }`

`AttendanceInitializationResponse` (`POST /api/attendance/initialize/{sessionId}`) :
```json
{
  "newlyCreatedCount": 24,
  "alreadyExistingCount": 6,
  "allAttendances": [ /* liste d'AttendanceResponse */ ]
}
```

`BulkAttendanceUpdateRequest` :
```json
{
  "updates": [
    { "attendanceId": "88888888-8888-8888-8888-888888888888", "status": "ABSENT" },
    { "attendanceId": "88888888-8888-8888-8888-888888888889", "status": "EXCUSED" }
  ]
}
```
réponse : `[ <AttendanceResponse>, <AttendanceResponse> ]`

**Enum `AttendanceStatus`** : `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

### 2.4 Audit Logs — `/api/audit-logs` (rôle `ADMIN`)

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| GET | `/api/audit-logs` | `action`,`resource`,`userId`,`from`,`to` (optionnels), `page`(def. 0),`size`(def. 50) | `Page<AuditLogResponse>` | 200 |
| GET | `/api/audit-logs/stats` | `from`,`to` (optionnels) | `Map<String,Object>` | 200 |
| GET | `/api/audit-logs/export` | mêmes filtres | CSV (`text/csv`) | 200 |
| DELETE | `/api/audit-logs` | header `X-Confirm-Purge` (doit valoir `CONFIRM_PURGE_ALL_LOGS`) | — | 204 / 403 si header absent ou invalide |

`GET /api/audit-logs` — réponse `200` (page Spring Data) :
```json
{
  "content": [
    {
      "id": "log-1",
      "timestamp": "2026-07-13T09:00:00Z",
      "userId": "99999999-9999-9999-9999-999999999999",
      "username": "jdupont",
      "action": "CREATE",
      "resource": "Student",
      "resourceId": "11111111-1111-1111-1111-111111111111",
      "httpMethod": "POST",
      "httpStatus": 201,
      "ipAddress": "10.0.0.5",
      "details": "Student created"
    }
  ],
  "totalPages": 3,
  "totalElements": 128,
  "number": 0
}
```

`GET /api/audit-logs/stats` :
```json
{ "total": 128, "creates": 40, "updates": 60, "deletes": 10, "errors": 18 }
```

`GET /api/audit-logs/export` — corps CSV brut, header `Content-Disposition: attachment; filename="audit-logs.csv"`.

### 2.5 Audit Logs internes — `/internal/audit-logs` (non exposé via gateway)

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/internal/audit-logs` | `AuditRequest` (sans validation) | — | 200 |

Requête :
```json
{
  "userId": "99999999-9999-9999-9999-999999999999",
  "username": "jdupont",
  "action": "CREATE",
  "resource": "Student",
  "resourceId": "11111111-1111-1111-1111-111111111111",
  "httpMethod": "POST",
  "httpStatus": 201,
  "details": "Student created",
  "ipAddress": "10.0.0.5"
}
```
Appelé uniquement par le filtre `AuditGlobalFilter` de la gateway ; accessible seulement à l'intérieur du réseau du cluster.

### 2.6 Class Groups — `/api/class-groups`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/class-groups` | `@Valid ClassGroupRequest` | `ClassGroupResponse` | 201 |
| GET | `/api/class-groups` | `page`,`size` (optionnels) | liste/page | 200 |
| GET | `/api/class-groups/{id}` | `id:UUID` | `ClassGroupResponse` | 200/404 |
| GET | `/api/class-groups/department/{departmentId}` | `departmentId:UUID` | `List<ClassGroupResponse>` | 200 |
| GET | `/api/class-groups/{classGroupId}/students` | `classGroupId:UUID` | `List<EnrollmentResponse>` | 200 |
| POST | `/api/class-groups/{classGroupId}/students/{studentId}` | 2×`UUID` | `EnrollmentResponse` | 201 / 409 (déjà inscrit) / 400 |
| PUT | `/api/class-groups/{id}` | `id:UUID`, `@Valid ClassGroupRequest` | `ClassGroupResponse` | 200 |
| DELETE | `/api/class-groups/{id}` | `id:UUID` | — | 204 |

`ClassGroupRequest` :
```json
{ "code": "L3-INFO-A", "name": "Licence 3 Informatique - Groupe A", "departmentId": "66666666-6666-6666-6666-666666666666", "level": 3 }
```
`ClassGroupResponse` :
```json
{ "id": "55555555-5555-5555-5555-555555555555", "code": "L3-INFO-A", "name": "Licence 3 Informatique - Groupe A", "departmentId": "66666666-6666-6666-6666-666666666666", "level": 3 }
```
`EnrollmentResponse` (voir §2.17).

### 2.7 Health — `/api/education-core/health` (public via gateway)

| Méthode | Chemin | Retour | Statut |
|---|---|---|---|
| GET | `/api/education-core/health` | — | 200 |

Réponse :
```json
{ "service": "education-core-service", "status": "UP", "modules": ["students", "instructors", "attendance", "grades", "reports", "..."] }
```

### 2.8 Departments — `/api/departments`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/departments` | `@Valid DepartmentRequest` | `DepartmentResponse` | 201 |
| GET | `/api/departments` | `page`,`size` (optionnels) | liste/page | 200 |
| GET | `/api/departments/{id}` | `id:UUID` | `DepartmentResponse` | 200/404 |
| PUT | `/api/departments/{id}` | `id:UUID`, `@Valid DepartmentRequest` | `DepartmentResponse` | 200 |
| DELETE | `/api/departments/{id}` | `id:UUID` | — | 204 |

`DepartmentRequest` : `{ "code": "INFO", "name": "Informatique" }`
`DepartmentResponse` : `{ "id": "66666666-6666-6666-6666-666666666666", "code": "INFO", "name": "Informatique" }`

### 2.9 Discipline — `/api/discipline` (rôles `ADMIN`,`MANAGER`)

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| GET | `/api/discipline` | `status`,`severity`,`studentId` (optionnels), `page`(def.0),`size`(def.20) | `Page<CaseResponse>` | 200 |
| GET | `/api/discipline/stats` | — | `StatsResponse` | 200 |
| GET | `/api/discipline/{id}` | `id:UUID` | `CaseResponse` | 200/404 |
| POST | `/api/discipline` | `CreateRequest` (⚠ pas de `@Valid`) | `CaseResponse` | 201 |
| PUT | `/api/discipline/{id}` | `id:UUID`, `UpdateRequest` (⚠ pas de `@Valid`) | `CaseResponse` | 200/404 |
| DELETE | `/api/discipline/{id}` | `id:UUID` | — | 204/404 |

`CreateRequest` :
```json
{
  "studentId": "11111111-1111-1111-1111-111111111111",
  "studentName": "Jean Dupont",
  "violation": "Retard répété",
  "description": "3 retards en 2 semaines",
  "severity": "LOW",
  "reportedBy": "jdupont-instructor"
}
```
`CaseResponse` :
```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "studentId": "11111111-1111-1111-1111-111111111111",
  "studentName": "Jean Dupont",
  "violation": "Retard répété",
  "description": "3 retards en 2 semaines",
  "severity": "LOW",
  "status": "PENDING",
  "reportedBy": "jdupont-instructor",
  "actionTaken": null,
  "resolutionNotes": null,
  "dateReported": "2026-07-13",
  "lastUpdated": "2026-07-13"
}
```
`UpdateRequest` : `{ "status": "RESOLVED", "actionTaken": "Avertissement écrit", "resolutionNotes": "Cas clos", "severity": "LOW", "violation": "Retard répété", "description": "3 retards en 2 semaines" }`
`StatsResponse` : `{ "total": 42, "pending": 10, "underReview": 5, "resolved": 25, "appealed": 2 }`

*(champs `status`/`severity` : chaînes libres, aucune énumération typée détectée dans le code — valeurs usuelles observées : `PENDING`,`UNDER_REVIEW`,`RESOLVED`,`APPEALED` / `LOW`,`MEDIUM`,`HIGH`)*

### 2.10 Grades — `/api/grades`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/grades` | `@Valid GradeRequest` | `GradeResponse` | 201 |
| GET | `/api/grades` | `studentId`,`subjectId` (optionnels), `page`,`size` (optionnels) | liste/page | 200 |
| GET | `/api/grades/{id}` | `id:UUID` | `GradeResponse` | 200/404 |
| GET | `/api/grades/student/{studentId}` | `studentId:UUID` | `List<GradeResponse>` | 200 |
| GET | `/api/grades/subject/{subjectId}` | `subjectId:UUID` | `List<GradeResponse>` | 200 |
| PUT | `/api/grades/{id}` | `id:UUID`, `@Valid GradeRequest` | `GradeResponse` | 200 |
| DELETE | `/api/grades/{id}` | `id:UUID` | — | 204 |

`GradeRequest` :
```json
{
  "studentId": "11111111-1111-1111-1111-111111111111",
  "subjectId": "22222222-2222-2222-2222-222222222222",
  "instructorId": "33333333-3333-3333-3333-333333333333",
  "value": 15.5,
  "maxValue": 20.0,
  "evaluationType": "EXAM",
  "comment": "Bonne maîtrise du sujet",
  "gradedAt": "2026-07-10T14:00:00Z"
}
```
`GradeResponse` :
```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "studentId": "11111111-1111-1111-1111-111111111111",
  "subjectId": "22222222-2222-2222-2222-222222222222",
  "instructorId": "33333333-3333-3333-3333-333333333333",
  "value": 15.5,
  "maxValue": 20.0,
  "evaluationType": "EXAM",
  "comment": "Bonne maîtrise du sujet",
  "gradedAt": "2026-07-10T14:00:00Z",
  "createdAt": "2026-07-10T14:05:00Z"
}
```

**Enum `EvaluationType`** : `EXAM`, `QUIZ`, `HOMEWORK`, `PROJECT`, `PARTICIPATION`, `OTHER`

### 2.11 Instructors — `/api/instructors`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/instructors` | `@Valid InstructorRequest` | `InstructorCreationResponse` | 201 |
| GET | `/api/instructors` | `page`,`size` (optionnels) | liste/page | 200 |
| GET | `/api/instructors/{id}` | `id:UUID` | `InstructorResponse` | 200/404 |
| GET | `/api/instructors/user/{userId}` | `userId:String` | `InstructorResponse` | 200/404 |
| GET | `/api/instructors/me` | header `X-User-Id` (optionnel) ou `Principal` | `InstructorResponse` | 200/404 ; 400 si aucun user id résolu |
| GET | `/api/instructors/{instructorId}/stats` | `instructorId:UUID` | `Map` | 200 |
| GET | `/api/instructors/{instructorId}/attendance-stats` | `instructorId:UUID` | `Map` | 200 |
| PUT | `/api/instructors/{id}` | `id:UUID`, `@Valid InstructorRequest` | `InstructorResponse` | 200 |
| DELETE | `/api/instructors/{id}` | `id:UUID` | — | 204 |

`InstructorRequest` : `{ "code": "PROF-042", "name": "Marie Curie", "email": "marie.curie@example.com" }`
`InstructorResponse` : `{ "id": "33333333-3333-3333-3333-333333333333", "userId": "99999999-9999-9999-9999-999999999999", "code": "PROF-042", "name": "Marie Curie", "email": "marie.curie@example.com" }`
`InstructorCreationResponse` (uniquement à la création) :
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "userId": "99999999-9999-9999-9999-999999999999",
  "code": "PROF-042",
  "name": "Marie Curie",
  "email": "marie.curie@example.com",
  "temporaryPassword": "Tmp-8f3ak2"
}
```
`GET /api/instructors/{id}/stats` : `{ "instructorId": "33333333-3333-3333-3333-333333333333", "totalSessions": 120, "upcomingSessions": 8 }`
`GET /api/instructors/{id}/attendance-stats` : `{ "instructorId": "33333333-3333-3333-3333-333333333333", "sessionsCount": 120, "recordsCount": 2400, "presentCount": 2100, "absentCount": 180, "lateCount": 90, "excusedCount": 30 }`

### 2.12 Manager — 5 contrôleurs (rôles `ADMIN`,`MANAGER`)

#### 2.12.1 ManagerActionController — `/api/manager-actions`

| Méthode | Chemin | Paramètres | Retour |
|---|---|---|---|
| POST | `/api/manager-actions` | body `ManagerAction` (entité JPA, pas de `@Valid`) | `ManagerAction` |
| GET | `/api/manager-actions/manager/{managerId}` | `managerId:UUID`, `page`(def.0),`size`(def.20) | `Page<ManagerAction>` |
| GET | `/api/manager-actions/manager/{managerId}/type/{actionType}` | `managerId:UUID`, `actionType:ManagerAction.ActionType` | `List<ManagerAction>` |
| GET | `/api/manager-actions/manager/{managerId}/period` | `managerId:UUID`, `start`,`end:LocalDateTime` (requis, ISO_DATE_TIME) | `List<ManagerAction>` |
| GET | `/api/manager-actions/manager/{managerId}/recent` | `managerId:UUID`, `limit`(def.10) | `List<ManagerAction>` |
| GET | `/api/manager-actions/manager/{managerId}/statistics` | `managerId:UUID`, `days`(def.30) | `List<Object[]>` (agrégat brut par type d'action) |

`ManagerAction` (entité, request = response) :
```json
{
  "id": "cccccccc-0000-0000-0000-000000000001",
  "managerId": "44444444-4444-4444-4444-444444444444",
  "entityId": "11111111-1111-1111-1111-111111111111",
  "actionType": "APPROVE_ENROLLMENT",
  "entityType": "Student",
  "details": "Inscription validée",
  "reason": "Dossier complet",
  "ipAddress": "10.0.0.5",
  "status": "SUCCESS",
  "actionTimestamp": "2026-07-13T09:00:00"
}
```
`GET .../statistics` — réponse (agrégat `Object[]`, sérialisé en tableaux hétérogènes) :
```json
[ ["APPROVE_ENROLLMENT", 12], ["VALIDATE_GRADE", 30], ["APPROVE_ABSENCE_JUSTIFICATION", 5] ]
```

#### 2.12.2 ManagerAssignmentController — `/api/manager-assignments`

| Méthode | Chemin | Paramètres | Retour |
|---|---|---|---|
| POST | `/api/manager-assignments` | body `ManagerAssignment` (entité, pas de `@Valid`) | `ManagerAssignment` |
| GET | `/api/manager-assignments/manager/{managerId}` | `managerId:UUID` | `List<ManagerAssignment>` |
| GET | `/api/manager-assignments/manager/{managerId}/active` | `managerId:UUID` | `List<ManagerAssignment>` |
| GET | `/api/manager-assignments/department/{departmentId}` | `departmentId:UUID` | `List<ManagerAssignment>` |
| GET | `/api/manager-assignments/class/{classGroupId}` | `classGroupId:UUID` | `List<ManagerAssignment>` |
| GET | `/api/manager-assignments/module/{teachingModuleId}` | `teachingModuleId:UUID` | `List<ManagerAssignment>` |
| GET | `/api/manager-assignments/subject/{subjectId}` | `subjectId:UUID` | `List<ManagerAssignment>` |
| GET | `/api/manager-assignments/manager/{managerId}/type/{type}` | `managerId:UUID`, `type:ManagerAssignment.AssignmentType` | `List<ManagerAssignment>` |
| DELETE | `/api/manager-assignments/{assignmentId}` | `assignmentId:UUID`, `revokedBy:UUID` (requis) | `ManagerAssignment` (révoquée) |

`ManagerAssignment` :
```json
{
  "id": "dddddddd-0000-0000-0000-000000000001",
  "managerId": "44444444-4444-4444-4444-444444444444",
  "departmentId": "66666666-6666-6666-6666-666666666666",
  "classGroupId": null,
  "teachingModuleId": null,
  "subjectId": null,
  "academicYearId": "aaaaaaaa-0000-0000-0000-000000000001",
  "assignedBy": "99999999-9999-9999-9999-999999999999",
  "revokedBy": null,
  "assignmentType": "DEPARTMENT_HEAD",
  "assignedAt": "2026-07-01T08:00:00",
  "revokedAt": null,
  "isActive": true,
  "notes": "Nomination annuelle"
}
```

#### 2.12.3 ManagerController — `/api/managers`

| Méthode | Chemin | Paramètres | Retour |
|---|---|---|---|
| POST | `/api/managers` | body `Manager` (entité, pas de `@Valid`) | `Map` |
| GET | `/api/managers/{id}` | `id:UUID` | `Manager` |
| GET | `/api/managers/user/{userId}` | `userId:String` | `Manager` |
| GET | `/api/managers/me` | header `X-User-Id` (optionnel) ou `Principal` | `Manager` (400 si non résolu) |
| GET | `/api/managers/employee/{employeeNumber}` | `employeeNumber:String` | `Manager` |
| GET | `/api/managers/active` | — | `List<Manager>` |
| GET | `/api/managers/level/{level}` | `level:Manager.ManagerLevel`, `page`(def.0),`size`(def.20) | `Page<Manager>` |
| GET | `/api/managers/search` | `query` (requis) | `List<Manager>` |
| PUT | `/api/managers/{id}` | `id:UUID`, body `Manager` | `Manager` |
| PATCH | `/api/managers/{id}/status` | `id:UUID`, `status:Manager.Status` (requis) | `Manager` |
| DELETE | `/api/managers/{id}` | `id:UUID` | — 204 |
| POST | `/api/managers/{managerId}/subjects/{subjectId}/assign/{instructorId}` | 3×`UUID` | `Subject` |
| GET | `/api/managers/{managerId}/department/class-groups` | `managerId:UUID` | `List<ClassGroupResponse>` |
| GET | `/api/managers/{managerId}/department/sessions` | `managerId:UUID` | `List<SessionResponse>` |
| GET | `/api/managers/{managerId}/department/attendance` | `managerId:UUID` | `List<AttendanceResponse>` |
| PATCH | `/api/managers/{managerId}/attendance/{attendanceId}/status` | 2×`UUID`, `@Valid AttendanceStatusUpdateRequest` | `AttendanceResponse` |

`POST /api/managers` — réponse :
```json
{
  "id": "44444444-4444-4444-4444-444444444444",
  "userId": "99999999-9999-9999-9999-999999999999",
  "employeeNumber": "MGR-007",
  "firstName": "Alice",
  "lastName": "Martin",
  "email": "alice.martin@example.com",
  "temporaryPassword": "Tmp-9c2fz1"
}
```
`Manager` (GET/PUT) :
```json
{
  "id": "44444444-4444-4444-4444-444444444444",
  "userId": "99999999-9999-9999-9999-999999999999",
  "employeeNumber": "MGR-007",
  "firstName": "Alice",
  "lastName": "Martin",
  "email": "alice.martin@example.com",
  "phone": "+33612345678",
  "specialization": "Gestion académique",
  "bio": null,
  "officeLocation": "Bât. A, bureau 12",
  "officePhone": "+33123456789",
  "dateOfBirth": "1985-04-12",
  "hireDate": "2020-09-01",
  "level": "HEAD_OF_DEPARTMENT",
  "status": "ACTIVE",
  "createdAt": "2020-09-01T08:00:00",
  "updatedAt": "2026-07-01T08:00:00"
}
```

#### 2.12.4 ManagerResponsibilityController — `/api/manager-responsibilities`

| Méthode | Chemin | Paramètres | Retour |
|---|---|---|---|
| POST | `/api/manager-responsibilities` | body `ManagerResponsibility` (entité) | `ManagerResponsibility` |
| GET | `/api/manager-responsibilities/manager/{managerId}` | `managerId:UUID` | `List<ManagerResponsibility>` |
| GET | `/api/manager-responsibilities/{responsibilityId}` | `responsibilityId:UUID` | `ManagerResponsibility` |
| GET | `/api/manager-responsibilities/manager/{managerId}/approvals` | `managerId:UUID` | `List<ManagerResponsibility>` |
| GET | `/api/manager-responsibilities/manager/{managerId}/check/{type}` | `managerId:UUID`, `type:ResponsibilityType` | `{"hasResponsibility":bool}` |
| GET | `/api/manager-responsibilities/manager/{managerId}/can-approve/{type}` | idem | `{"canApprove":bool}` |
| DELETE | `/api/manager-responsibilities/{responsibilityId}` | `responsibilityId:UUID` | `ManagerResponsibility` |

`ManagerResponsibility` :
```json
{
  "id": "eeeeeeee-0000-0000-0000-000000000001",
  "managerId": "44444444-4444-4444-4444-444444444444",
  "responsibilityType": "GRADE_VALIDATION",
  "description": "Validation des notes du département Informatique",
  "canApprove": true,
  "canReject": true,
  "canModify": false,
  "canView": true,
  "isActive": true,
  "grantedAt": "2026-01-01T00:00:00",
  "revokedAt": null
}
```
`GET .../check/{type}` : `{ "hasResponsibility": true }`
`GET .../can-approve/{type}` : `{ "canApprove": true }`

#### 2.12.5 ValidationController (manager) — `/api/validations` (bean `managerValidationController`)

| Méthode | Chemin | Paramètres | Retour |
|---|---|---|---|
| GET | `/api/validations/attendances/pending` | `classGroupId`,`subjectId` (optionnels) | `List<PendingAttendanceDTO>` |
| POST | `/api/validations/attendances/{attendanceId}/validate` | `attendanceId:UUID`, body `AttendanceValidationRequest` (pas de `@Valid`) | `ValidationResultDTO` |
| POST | `/api/validations/attendances/bulk-validate` | body `BulkAttendanceValidationRequest` (pas de `@Valid`) | `BulkValidationResultDTO` |
| GET | `/api/validations/stats` | `managerId` (optionnel) | `ValidationStatsDTO` |

> ⚠ **Conflit de préfixe** : ce contrôleur et `validation.api.ValidationController` (§2.19) sont tous deux mappés sur `/api/validations`, différenciés uniquement par nom de bean. Les sous-chemins ne se recouvrent pas donc Spring route correctement, mais deux domaines distincts partagent le même préfixe REST.

`PendingAttendanceDTO` :
```json
{
  "attendanceId": "88888888-8888-8888-8888-888888888888",
  "studentId": "11111111-1111-1111-1111-111111111111",
  "classGroupId": "55555555-5555-5555-5555-555555555555",
  "subjectId": "22222222-2222-2222-2222-222222222222",
  "recordedBy": "33333333-3333-3333-3333-333333333333",
  "studentName": "Jean Dupont",
  "classGroupName": "L3-INFO-A",
  "subjectName": "Bases de données",
  "status": "ABSENT",
  "justification": "Certificat médical joint",
  "recordedByName": "Marie Curie",
  "sessionDate": "2026-07-10",
  "justificationSubmittedAt": "2026-07-10T18:00:00",
  "recordedAt": "2026-07-10T09:00:00"
}
```
`AttendanceValidationRequest` (requête) : `{ "validatedBy": "44444444-4444-4444-4444-444444444444", "decision": "VALIDATED", "managerComment": "Justificatif conforme" }`
`ValidationResultDTO` (réponse) : `{ "success": true, "message": "Validation enregistrée", "entityType": "Attendance", "newStatus": "EXCUSED", "errorDetails": null, "validatedAt": "2026-07-13T10:00:00" }`
`BulkAttendanceValidationRequest` : `{ "attendanceIds": ["88888888-8888-8888-8888-888888888888"], "validatedBy": "44444444-4444-4444-4444-444444444444", "decision": "VALIDATED", "managerComment": "Lot validé" }`
`BulkValidationResultDTO` : `{ "totalRequested": 5, "successCount": 4, "failureCount": 1, "successIds": ["88888888-..."], "failureDetails": ["88888888-... : déjà validé"] }`
`ValidationStatsDTO` : `{ "pendingAttendances": 12, "validatedAttendances": 340, "rejectedAttendances": 8, "totalValidationsToday": 15 }`

**Entités domaine exposées directement** (sans DTO dédié, sans `@Valid`) : `Manager`, `ManagerAction`, `ManagerAssignment`, `ManagerResponsibility` — champs listés ci-dessus.

**Enums** : `Manager.ManagerLevel{HEAD_OF_DEPARTMENT, ACADEMIC_DIRECTOR, PROGRAM_COORDINATOR, YEAR_COORDINATOR, QUALITY_ASSURANCE_MANAGER, STUDENT_AFFAIRS_MANAGER}` · `Manager.Status{ACTIVE, ON_LEAVE, SUSPENDED, TERMINATED}` · `ManagerAction.ActionType{APPROVE_ENROLLMENT, REJECT_ENROLLMENT, VALIDATE_GRADE, APPROVE_ABSENCE_JUSTIFICATION, MODIFY_SCHEDULE, APPROVE_BUDGET, EVALUATE_STAFF, GENERATE_REPORT}` · `ManagerAction.ActionStatus{SUCCESS, FAILED, PENDING, CANCELLED}` · `ManagerAssignment.AssignmentType{DEPARTMENT_HEAD, CLASS_SUPERVISOR, MODULE_SUPERVISOR, SUBJECT_SUPERVISOR, PROGRAM_MANAGER, YEAR_COORDINATOR, QUALITY_CONTROLLER}` · `ManagerResponsibility.ResponsibilityType{STUDENT_ENROLLMENT, GRADE_VALIDATION, ATTENDANCE_MONITORING, SCHEDULE_MANAGEMENT, BUDGET_APPROVAL, STAFF_EVALUATION, REPORT_GENERATION, EXAM_COORDINATION}`.

### 2.13 Teaching Modules — `/api/modules`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/modules` | `@Valid TeachingModuleRequest` | `TeachingModuleResponse` | 201 |
| GET | `/api/modules` | `page`,`size` (optionnels) | liste/page | 200 |
| GET | `/api/modules/{id}` | `id:UUID` | `TeachingModuleResponse` | 200/404 |
| PUT | `/api/modules/{id}` | `id:UUID`, `@Valid TeachingModuleRequest` | `TeachingModuleResponse` | 200 |
| DELETE | `/api/modules/{id}` | `id:UUID` | — | 204 |

`TeachingModuleRequest` : `{ "code": "MOD-BDD", "name": "Bases de données" }`
`TeachingModuleResponse` : `{ "id": "bbbbbbbb-0000-0000-0000-000000000001", "code": "MOD-BDD", "name": "Bases de données" }`

### 2.14 Reports — `/api/reports` (lecture seule)

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| GET | `/api/reports/attendance/student/{studentId}` | `studentId:UUID` | `AttendanceReportResponse` | 200 |
| GET | `/api/reports/attendance/class-group/{classGroupId}` | `classGroupId:UUID` | `AttendanceReportResponse` | 200 |
| GET | `/api/reports/grades/student/{studentId}` | `studentId:UUID` | `GradeReportResponse` | 200 |
| GET | `/api/reports/grades/subject/{subjectId}` | `subjectId:UUID` | `GradeReportResponse` | 200 |

`AttendanceReportResponse` :
```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "scope": "STUDENT",
  "totalRecords": 120,
  "present": 100,
  "absent": 12,
  "late": 6,
  "excused": 2,
  "attendanceRatePercent": 83.3
}
```
`GradeReportResponse` :
```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "scope": "STUDENT",
  "count": 24,
  "averagePercent": 78.5,
  "minPercent": 45.0,
  "maxPercent": 98.0,
  "bySubject": [
    { "subjectId": "22222222-2222-2222-2222-222222222222", "count": 6, "averagePercent": 82.0 }
  ]
}
```

### 2.15 Sessions — `/api/sessions`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/sessions` | `@Valid SessionRequest` | `SessionResponse` | 201 |
| GET | `/api/sessions` | `managerId`,`classGroupId`,`instructorId` (optionnels) | `List<SessionResponse>` | 200 |
| GET | `/api/sessions/instructor/{instructorId}` | `instructorId:UUID` | `List<SessionResponse>` | 200 |
| GET | `/api/sessions/instructor/{instructorId}/date/{date}` | `instructorId:UUID`, `date:LocalDate` | `List<SessionResponse>` | 200 |
| GET | `/api/sessions/department/{departmentId}/class/{classGroupId}` | 2×`UUID` | `List<SessionResponse>` | 200 |
| GET | `/api/sessions/upcoming` | `instructorId`,`classGroupId` (optionnels), `limit`(def.20) | `List<SessionResponse>` | 200 |
| GET | `/api/sessions/class-group/{classGroupId}/week` | `classGroupId:UUID`, `weekStart:LocalDate` (requis) | `List<SessionResponse>` | 200 |
| GET | `/api/sessions/class-group/{classGroupId}/week/grouped` | idem | `Map<String,List<SessionResponse>>` | 200 |
| GET | `/api/sessions/{id}` | `id:UUID` | `SessionResponse` | 200/404 |
| PUT | `/api/sessions/{id}` | `id:UUID`, `@Valid SessionRequest` | `SessionResponse` | 200/404 |
| DELETE | `/api/sessions/{id}` | `id:UUID` | — | 204/404 |

`SessionRequest` :
```json
{
  "managerId": "44444444-4444-4444-4444-444444444444",
  "departmentId": "66666666-6666-6666-6666-666666666666",
  "classGroupId": "55555555-5555-5555-5555-555555555555",
  "teachingModuleId": "bbbbbbbb-0000-0000-0000-000000000001",
  "subjectId": "22222222-2222-2222-2222-222222222222",
  "instructorId": "33333333-3333-3333-3333-333333333333",
  "startsAt": "2026-07-14T08:00:00",
  "endsAt": "2026-07-14T10:00:00",
  "room": "A104"
}
```
`SessionResponse` : ajoute `id:UUID` et `createdAt:Instant` aux champs ci-dessus.

`GET .../week/grouped` — réponse :
```json
{
  "2026-07-14": [ /* SessionResponse[] */ ],
  "2026-07-15": [ /* SessionResponse[] */ ]
}
```

### 2.16 Students — `/api/students`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/students` | `@Valid StudentRequest` | `StudentCreationResponse` | 201 |
| POST | `/api/students/bulk-upload` (JSON) | body `List<@Valid StudentRequest>` | `List<StudentResponse>` | 201 |
| POST | `/api/students/bulk-upload` (multipart/form-data) | `file:MultipartFile` (CSV) | `List<StudentResponse>` | 201 / 400 si parsing invalide |
| GET | `/api/students` | `page`,`size` (optionnels) | liste/page | 200 |
| GET | `/api/students/{id}` | `id:UUID` | `StudentResponse` | 200/404 |
| PUT | `/api/students/{id}` | `id:UUID`, `@Valid StudentRequest` | `StudentResponse` | 200 |
| DELETE | `/api/students/{id}` | `id:UUID` | — | 204 |
| GET | `/api/students/user/{userId}` | `userId:String` | `StudentResponse` | 200/404 |
| GET | `/api/students/me` | header `X-User-Id` (optionnel) ou `Principal` | `StudentResponse` | 200/404 ; 400 si non résolu |

Les deux endpoints `bulk-upload` sont distingués par leur `Content-Type` (`consumes`).

`StudentRequest` :
```json
{
  "studentNumber": "ETU-2026-001",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jdupont@example.com",
  "phoneNumber": "+33612345678",
  "dateOfBirth": "2005-03-14"
}
```
`StudentResponse` :
```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "userId": "99999999-9999-9999-9999-999999999999",
  "studentNumber": "ETU-2026-001",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jdupont@example.com",
  "phoneNumber": "+33612345678",
  "dateOfBirth": "2005-03-14",
  "createdAt": "2026-07-13T10:00:00Z"
}
```
`StudentCreationResponse` (uniquement à la création) : idem + `"temporaryPassword": "Tmp-4a1bx9"`.

`POST /api/students/bulk-upload` (JSON) — requête : `[ <StudentRequest>, <StudentRequest>, ... ]` — réponse : `[ <StudentResponse>, ... ]`

### 2.17 Enrollments — `/api/enrollments`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/enrollments` | `@Valid EnrollmentRequest` | `EnrollmentResponse` | 201 |
| GET | `/api/enrollments` | `studentId` (optionnel) | `List<EnrollmentResponse>` | 200 |

`EnrollmentRequest` : `{ "studentId": "11111111-1111-1111-1111-111111111111", "classGroupId": "55555555-5555-5555-5555-555555555555", "status": "ACTIVE" }`
`EnrollmentResponse` :
```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "studentId": "11111111-1111-1111-1111-111111111111",
  "classGroupId": "55555555-5555-5555-5555-555555555555",
  "status": "ACTIVE",
  "createdAt": "2026-07-13T10:00:00Z"
}
```

**Enum `EnrollmentStatus`** : `ACTIVE`, `INACTIVE`, `COMPLETED`, `CANCELLED`

### 2.18 Subjects — `/api/subjects`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/subjects` | `@Valid SubjectRequest` | `SubjectResponse` | 201 |
| GET | `/api/subjects` | `page`,`size` (optionnels) | liste/page | 200 |
| GET | `/api/subjects/{id}` | `id:UUID` | `SubjectResponse` | 200/404 |
| PUT | `/api/subjects/{id}` | `id:UUID`, `@Valid SubjectRequest` | `SubjectResponse` | 200 |
| DELETE | `/api/subjects/{id}` | `id:UUID` | — | 204 |

`SubjectRequest` : `{ "code": "BDD-101", "name": "Bases de données", "teachingModuleId": "bbbbbbbb-0000-0000-0000-000000000001", "instructorId": "33333333-3333-3333-3333-333333333333" }`
`SubjectResponse` : `{ "id": "22222222-2222-2222-2222-222222222222", "code": "BDD-101", "name": "Bases de données", "teachingModuleId": "bbbbbbbb-0000-0000-0000-000000000001", "instructorId": "33333333-3333-3333-3333-333333333333" }`

> ⚠ La gateway route aussi `/api/subject-offerings/**`, mais aucun `SubjectOfferingController` n'existe dans le code — route morte côté gateway.

### 2.19 Validations — `/api/validations` (bean `coreValidationController`, rôles `ADMIN`,`MANAGER`)

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/validations` | `@Valid ValidationDecisionRequest` | `ValidationDecisionResponse` | 201 |
| PATCH | `/api/validations/{id}` | `id:UUID`, `@Valid ValidationDecisionRequest` | `ValidationDecisionResponse` | 200 |
| GET | `/api/validations` | `targetId` (optionnel) | `List<ValidationDecisionResponse>` | 200 |
| GET | `/api/validations/{id}` | `id:UUID` | `ValidationDecisionResponse` | 200/404 |

`ValidationDecisionRequest` :
```json
{
  "managerId": "44444444-4444-4444-4444-444444444444",
  "targetType": "Grade",
  "targetId": "88888888-8888-8888-8888-888888888888",
  "status": "APPROVED",
  "reason": "Note conforme au barème"
}
```
`ValidationDecisionResponse` :
```json
{
  "id": "ffffffff-0000-0000-0000-000000000001",
  "managerId": "44444444-4444-4444-4444-444444444444",
  "targetId": "88888888-8888-8888-8888-888888888888",
  "targetType": "Grade",
  "status": "APPROVED",
  "reason": "Note conforme au barème",
  "decidedAt": "2026-07-13T10:00:00Z"
}
```

**Enum `ValidationDecisionStatus`** : `APPROVED`, `REJECTED`, `PENDING`

Voir §2.12.5 pour le conflit de préfixe avec `manager.api.ValidationController`.

---

## 3. communication-hub-service

### 3.1 Health — `/api/communication-hub/health`

| Méthode | Chemin | Retour | Statut |
|---|---|---|---|
| GET | `/api/communication-hub/health` | — | 200 |

Réponse :
```json
{ "service": "communication-hub-service", "status": "UP", "modules": ["notifications", "messaging", "broadcast"] }
```

> ⚠ Non routé par la gateway (accessible uniquement en direct sur le port du service).

### 3.2 Messaging — `/api/messages`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/messages/send` | `@Valid MessageRequest` | `MessageResponse` | 201 |
| GET | `/api/messages/inbox/{userId}` | `userId:UUID` | `List<MessageResponse>` | 200 |
| GET | `/api/messages/sent/{userId}` | `userId:UUID` | `List<MessageResponse>` | 200 |
| GET | `/api/messages/{id}` | `id:UUID` | `MessageResponse` | 200/404 |
| GET | `/api/messages/unread/{userId}/count` | `userId:UUID` | `Long` | 200 |
| GET | `/api/messages/starred/{userId}` | `userId:UUID` | `List<MessageResponse>` | 200 |
| GET | `/api/messages/archived/{userId}` | `userId:UUID` | `List<MessageResponse>` | 200 |
| GET | `/api/messages/thread/{parentMessageId}` | `parentMessageId:UUID` | `List<MessageResponse>` | 200 |
| PATCH | `/api/messages/{messageId}/read/{receiverId}` | 2×`UUID` (⚠ `receiverId` non utilisé) | `MessageResponse` | 200 |
| PATCH | `/api/messages/{messageId}/star/{receiverId}` | idem | `MessageResponse` | 200 |
| PATCH | `/api/messages/{messageId}/archive/{receiverId}` | idem | `MessageResponse` | 200 |
| DELETE | `/api/messages/{messageId}/receiver/{receiverId}` | 2×`UUID` | — | 204/404 |

`MessageRequest` :
```json
{
  "senderId": "11111111-1111-1111-1111-111111111111",
  "receiverId": "33333333-3333-3333-3333-333333333333",
  "subject": "Question sur le TP",
  "content": "Bonjour, pouvez-vous préciser la consigne 3 ?",
  "parentMessageId": null
}
```
`MessageResponse` :
```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "senderId": "11111111-1111-1111-1111-111111111111",
  "receiverId": "33333333-3333-3333-3333-333333333333",
  "parentMessageId": null,
  "subject": "Question sur le TP",
  "content": "Bonjour, pouvez-vous préciser la consigne 3 ?",
  "read": false,
  "starred": false,
  "archived": false,
  "createdAt": "2026-07-13T10:00:00Z"
}
```
`GET /api/messages/unread/{userId}/count` — réponse `200` : `7` (nombre brut, pas d'enveloppe).

### 3.3 Notifications — `/api/notifications`

| Méthode | Chemin | Paramètres | Retour | Statut |
|---|---|---|---|---|
| POST | `/api/notifications` | `@Valid NotificationRequest` | `NotificationResponse` | 201 |
| GET | `/api/notifications/user/{userId}` | `userId:UUID` | `List<NotificationResponse>` | 200 |
| GET | `/api/notifications/user/{userId}/unread` | `userId:UUID` | `List<NotificationResponse>` | 200 |
| GET | `/api/notifications/user/{userId}/unread/count` | `userId:UUID` | `Long` | 200 |
| GET | `/api/notifications/user/{userId}/type/{type}` | `userId:UUID`, `type:String` | `List<NotificationResponse>` | 200 |
| GET | `/api/notifications/user/{userId}/channel/{channel}` | `userId:UUID`, `channel:String` | `List<NotificationResponse>` | 200 |
| GET | `/api/notifications/{id}` | `id:UUID` | `NotificationResponse` | 200/404 |
| PATCH | `/api/notifications/{id}/read` | `id:UUID` | `NotificationResponse` | 200 |
| PATCH | `/api/notifications/{id}/dismiss` | `id:UUID` | `NotificationResponse` | 200 |
| PATCH | `/api/notifications/user/{userId}/read-all` | `userId:UUID` | — | 200 |
| DELETE | `/api/notifications/{id}` | `id:UUID` | — | 204/404 |

`NotificationRequest` :
```json
{
  "userId": "11111111-1111-1111-1111-111111111111",
  "title": "Nouvelle note publiée",
  "message": "Votre note de Bases de données est disponible.",
  "type": "GRADE",
  "channel": "IN_APP"
}
```
`NotificationResponse` :
```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "userId": "11111111-1111-1111-1111-111111111111",
  "title": "Nouvelle note publiée",
  "message": "Votre note de Bases de données est disponible.",
  "type": "GRADE",
  "channel": "IN_APP",
  "status": "UNREAD",
  "createdAt": "2026-07-13T10:00:00Z",
  "readAt": null
}
```
`type`/`channel` : chaînes libres (aucune énumération typée) — valeurs usuelles observées : `type` ∈ {`GRADE`,`ATTENDANCE`,`DISCIPLINE`,`SYSTEM`,...}, `channel` ∈ {`IN_APP`,`EMAIL`,`SMS`,...}.

**Enum `NotificationStatus`** : `UNREAD`, `READ`, `DISMISSED`

Aucun endpoint `/internal/**` dans ce service.

---

## 4. Endpoints internes (service-à-service, hors gateway)

| Méthode | Chemin | Service | Appelant |
|---|---|---|---|
| POST | `/internal/audit-logs` | education-core-service | `AuditGlobalFilter` (gateway) |

---

## 5. Incohérences connues (factuel)

1. Deux contrôleurs distincts sont mappés sur `/api/validations` dans `education-core-service` (`manager.api.ValidationController` et `validation.api.ValidationController`), différenciés uniquement par nom de bean — voir §2.12.5 et §2.19.
2. La route gateway `academic-year-service` référence `/api/semesters/**`, mais aucun endpoint racine `/api/semesters` n'existe (seulement en sous-ressource de `/api/academic-years/{id}/semesters`).
3. La route gateway `academic-structure-service` référence `/api/subject-offerings/**`, mais aucun `SubjectOfferingController` n'a été trouvé.
4. Les endpoints `/health` custom ne sont routés par la gateway que pour `education-core-service` (`/api/education-core/health`) — celui de `communication-hub-service` (`/api/communication-hub/health`) n'est accessible qu'en direct sur le port du service.
5. Dans `MessagingController`, les 3 endpoints `PATCH /{messageId}/{read|star|archive}/{receiverId}` déclarent un `@PathVariable UUID receiverId` non utilisé dans le corps de la méthode.
6. `UserController.deleteUser` (identity-service) renvoie `200 OK` plutôt que `204 No Content`, contrairement aux suppressions d'education-core-service qui renvoient systématiquement `204`.
7. `DisciplinaryCaseController` (education-core-service) n'utilise `@Valid` sur aucun de ses `@RequestBody`.
8. `ManagerController`, `ManagerActionController`, `ManagerAssignmentController`, `ManagerResponsibilityController` acceptent/retournent directement les entités JPA (`Manager`, `ManagerAction`, `ManagerAssignment`, `ManagerResponsibility`) en `@RequestBody`/réponse, sans DTO dédié ni `@Valid`, contrairement au reste du service qui suit un pattern Request/Response DTO strict avec validation Bean Validation.

---

## 6. Références croisées

- Vue d'ensemble architecture, sécurité, configuration : [README.md](README.md)
- Détail des correctifs d'audit et scoring : [AUDIT_REPORT.md](AUDIT_REPORT.md)
- Documentation historique (partiellement obsolète — port et endpoints Grades/Reports non à jour) : [services/education-core-service/API.md](services/education-core-service/API.md)
