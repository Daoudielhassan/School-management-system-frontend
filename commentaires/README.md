# Frontend API Integration Guide

## 1. Overview

This project uses a microservices backend behind an API Gateway.

Frontend apps must call only the Gateway, never internal services directly.

Flow:

1. Frontend sends HTTP request to Gateway.
2. Gateway routes request to the right backend service.
3. Gateway returns a unified API surface to the frontend.

Benefits for frontend teams:

- Single entry point.
- Consistent authentication (JWT).
- Stable API paths during backend migrations.

## 2. Base URL

Use environment-specific base URLs in your frontend config.

```env
# Local
BASE_URL=http://localhost:8080/api

# Staging (example)
BASE_URL=https://staging-api.school.example.com/api

# Production (example)
BASE_URL=https://api.school.example.com/api
```

Recommended rule:

- Build all endpoint calls as `${BASE_URL}/...`
- Do not hardcode service ports like `8084`, `8091`, etc. in frontend code.

## 3. Authentication

### How login works

1. Frontend sends credentials to `POST /api/auth/login`.
2. Backend returns a JWT token (Bearer token).
3. Frontend stores token securely (memory or secure storage strategy).
4. Frontend sends token on protected requests:
   - `Authorization: Bearer <token>`

### Login request example

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "SecurePass123!"
}
```

### Login response example

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": "2f15d7c0-5a2b-4f7d-a2f0-8e85b31f3be2",
  "username": "john.doe",
  "email": "john.doe@school.edu",
  "role": "STUDENT",
  "mustChangePassword": false
}
```

> The token carries the user's `userId`, `email` and a single `role`
> (`ADMIN` | `MANAGER` | `INSTRUCTOR` | `STUDENT`). If `mustChangePassword` is
> `true`, the user was just provisioned (or reset by an admin) and must call
> `POST /api/auth/change-password` before using the app.

### JavaScript token storage and usage

```javascript
// auth.js
export function saveToken(token) {
  localStorage.setItem("access_token", token);
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

### Roles & access control

Every request (except `POST /api/auth/login` and `/health`) requires a valid
Bearer token. Authorization is enforced **both** at the gateway and inside each
service. Coarse rules today:

| Area | Path prefix | Allowed roles |
|------|-------------|---------------|
| Admin console / user management | `/api/admin/**`, `/api/users/**`, `/api/audit-logs/**` | `ADMIN` |
| Manager domain, validation, discipline | `/api/managers/**`, `/api/manager-*/**`, `/api/validations/**`, `/api/discipline/**` | `ADMIN`, `MANAGER` |
| Everything else | `/api/**` | any authenticated role |

- **401 Unauthorized** — no / invalid / expired token → redirect to login.
- **403 Forbidden** — valid token but the role is not allowed for that route →
  hide the action in the UI.

> Services never trust client-supplied identity headers: the gateway strips
> internal headers (e.g. `X-Internal-Api-Key`) from inbound traffic, and each
> service re-validates the JWT signature itself.

### First-login password change

When `mustChangePassword` is `true`, send the temporary password plus the new one:

```http
POST /api/auth/change-password
Content-Type: application/json

{ "userId": "<uuid>", "currentPassword": "<temp>", "newPassword": "<new>" }
```

### Token refresh

```http
POST /api/auth/refresh
Authorization: Bearer <current-token>
```

Returns a fresh `LoginResponse`. Tokens are stateless and expire after
`JWT_EXPIRATION` (default 24 h); `POST /api/auth/logout` is a client-side no-op.

## 4. Request Format

Most API endpoints follow this structure:

- `Content-Type: application/json`
- `Authorization: Bearer <token>` for protected routes
- JSON request/response payloads

### Common headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

### JSON body example

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.edu"
}
```

### Pagination and filtering pattern

Pagination is opt-in and currently supports only:

- `page` (0-based index)
- `size` (items per page)

Passing both switches the response to `{content, totalPages, totalElements, number}`;
omitting either returns a plain JSON array. Supported on: `/api/students`,
`/api/instructors`, `/api/class-groups`, `/api/departments`, `/api/subjects`,
`/api/modules`, `/api/academic-years`, `/api/grades`. `/api/discipline` has its
own richer pagination (`page`/`size`/`sort`/`status`/`severity`/`studentId`).

`sort` and generic filter params are **not** implemented globally elsewhere.
Some endpoints expose their own filters as query params or path segments (e.g.
`GET /api/attendance?studentId=&sessionId=&date=`, `GET /api/grades?studentId=&subjectId=`).

Example:

```http
GET /api/students?page=0&size=20
```

## 5. Core API Endpoints

Below are frontend-facing gateway endpoints.

### Authentication

- Path: `/api/auth/login`
- Method: `POST`
- Description: Authenticate user and return JWT.

Request example:

```json
{
  "username": "john.doe",
  "password": "SecurePass123!"
}
```

Response example:

```json
{
  "token": "<jwt-token>",
  "type": "Bearer",
  "userId": "8c1e5f7a-0b3d-4a2c-9e1f-2b7c6d5e4f30",
  "username": "john.doe",
  "email": "john.doe@school.edu",
  "role": "MANAGER",
  "mustChangePassword": false
}
```

### Students

- Path: `/api/students`
- Method: `GET`
- Description: Fetch paginated students list.

Request example:

```http
GET /api/students?page=0&size=20
Authorization: Bearer <token>
```

Response example:

When `page` and `size` are provided, the response is wrapped:

```json
{
  "content": [
    {
      "id": "2f15d7c0-5a2b-4f7d-a2f0-8e85b31f3be2",
      "userId": "9b1c...",
      "studentNumber": "S2026-001",
      "firstName": "Sara",
      "lastName": "Ali",
      "email": "sara.ali@school.edu",
      "phoneNumber": null,
      "dateOfBirth": "2005-04-12",
      "createdAt": "2026-03-23T09:00:00Z"
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  "number": 0
}
```

> Without `page`/`size`, `GET /api/students` returns a **plain JSON array** of the
> same student objects (no wrapper). Pagination supports `page` and `size` only
> (no `sort`).

- Path: `/api/students`
- Method: `POST`
- Description: Create a new student **and** provision its identity account. Returns a one-time `temporaryPassword`.

Request example:

```json
{
  "studentNumber": "S2026-002",
  "firstName": "Yassine",
  "lastName": "Bennani",
  "email": "yassine.bennani@school.edu",
  "phoneNumber": null,
  "dateOfBirth": "2005-09-01"
}
```

Response example (`201 Created`):

```json
{
  "id": "5a65b9a9-2413-4f57-aec6-965f1f523f5b",
  "userId": "c7f2...",
  "studentNumber": "S2026-002",
  "firstName": "Yassine",
  "lastName": "Bennani",
  "email": "yassine.bennani@school.edu",
  "phoneNumber": null,
  "dateOfBirth": "2005-09-01",
  "createdAt": "2026-03-23T09:05:00Z",
  "temporaryPassword": "Xh7$k2Pq"
}
```

> Bulk import: `POST /api/students/bulk-upload` (JSON array of the request above,
> or a CSV file via `multipart/form-data`).

### Instructors

- Path: `/api/instructors`
- Method: `GET`
- Description: List instructors (returns a **plain array**, not paginated).

Request example:

```http
GET /api/instructors
Authorization: Bearer <token>
```

Response example:

```json
[
  {
    "id": "f9d6e6e2-6e17-4d67-b5d7-52eb0cb3f20f",
    "userId": "a1b2...",
    "code": "INS-014",
    "name": "Nadia Karim",
    "email": "nadia.karim@school.edu"
  }
]
```

> Related: `GET /api/instructors/{id}`, `/api/instructors/me`,
> `/api/instructors/{id}/stats`, `/api/instructors/{id}/attendance-stats`.

### Attendance

Attendance is recorded **one record at a time** or updated in bulk. There is no
`courseId` / `records[]` batch-create endpoint.

- Path: `/api/attendance`
- Method: `POST`
- Description: Create a single attendance record.

Request example:

```json
{
  "studentId": "11111111-1111-1111-1111-111111111111",
  "sessionId": "c8e5b36d-bf51-4f2e-a1eb-4d2a2e7bbf44",
  "classGroupId": "b5e16a14-e7f2-4e8e-b20d-32b8459b5fca",
  "attendanceDate": "2026-03-23",
  "status": "PRESENT"
}
```

Response example (`201 Created`):

```json
{
  "id": "64a0428a-8fbe-4c76-9770-e70f16c3f6a5",
  "studentId": "11111111-1111-1111-1111-111111111111",
  "sessionId": "c8e5b36d-bf51-4f2e-a1eb-4d2a2e7bbf44",
  "classGroupId": "b5e16a14-e7f2-4e8e-b20d-32b8459b5fca",
  "attendanceDate": "2026-03-23",
  "status": "PRESENT",
  "updatedAt": "2026-03-23T09:10:00Z"
}
```

Common attendance flows:

- `POST /api/attendance/initialize/{sessionId}` — create PRESENT records for every
  enrolled student of the session.
- `PATCH /api/attendance/bulk-update` (or `PUT`) — update many records at once
  (`{ "updates": [ { "attendanceId": "...", "status": "ABSENT" }, ... ] }`).
- `PATCH /api/attendance/{id}/status` — change one record's status.
- `GET /api/attendance?studentId=&sessionId=&date=`, `GET /api/attendance/session/{sessionId}`, `GET /api/attendance/students/{studentId}`.

`status` values: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.

### Grades

- Path: `/api/grades`
- Method: `POST`
- Description: Record a grade for a student on a subject.

Request example:

```json
{
  "studentId": "11111111-1111-1111-1111-111111111111",
  "subjectId": "22222222-2222-2222-2222-222222222222",
  "instructorId": "33333333-3333-3333-3333-333333333333",
  "value": 15.5,
  "maxValue": 20,
  "evaluationType": "EXAM",
  "comment": "Good work",
  "gradedAt": "2026-03-23T09:00:00Z"
}
```

`evaluationType` is one of `EXAM`, `QUIZ`, `HOMEWORK`, `PROJECT`, `PARTICIPATION`, `OTHER`.
`gradedAt` is optional (defaults to now). `value` must be between `0` and `maxValue`.

Response example (`201 Created`) adds `id` and `createdAt` to the request fields.

Other endpoints:

- `GET /api/grades?studentId=&subjectId=&page=&size=` — list, filterable; paginated
  form (`page`+`size` together) returns `{content, totalPages, totalElements, number}`.
- `GET /api/grades/{id}`, `GET /api/grades/student/{studentId}`, `GET /api/grades/subject/{subjectId}`.
- `PUT /api/grades/{id}`, `DELETE /api/grades/{id}`.

### Reports

Read-only endpoints that aggregate existing attendance and grade data on demand
(nothing is stored separately for reports).

- `GET /api/reports/attendance/student/{studentId}` →
  `{ id, scope: "STUDENT", totalRecords, present, absent, late, excused, attendanceRatePercent }`
- `GET /api/reports/attendance/class-group/{classGroupId}` → same shape, `scope: "CLASS_GROUP"`.
- `GET /api/reports/grades/student/{studentId}` →
  `{ id, scope: "STUDENT", count, averagePercent, minPercent, maxPercent, bySubject: [{subjectId, count, averagePercent}] }`
  (grades are normalized to a 0–100 percentage so subjects graded on different
  scales, e.g. `/20` vs `/100`, are comparable).
- `GET /api/reports/grades/subject/{subjectId}` → same shape, `scope: "SUBJECT"`, no `bySubject` breakdown.

### Notifications & messaging (communication-hub)

Both domains are backed by real persistence (PostgreSQL via JPA/Flyway) — the
previous in-memory implementation could not create notifications at all and
never delivered messages to an inbox (it never stored the receiver).

- `POST /api/notifications` — `{ userId, title, message, type?, channel? }`
  (`type` defaults to `SYSTEM`, `channel` to `IN_APP`). Returns `201` with the
  created notification (`status: "UNREAD"`).
- `GET /api/notifications/user/{userId}`, `/unread`, `/unread/count`, `/type/{type}`, `/channel/{channel}`
- `GET /api/notifications/{id}`
- `PATCH /api/notifications/{id}/read`, `/{id}/dismiss`, `PATCH /api/notifications/user/{userId}/read-all`
- `DELETE /api/notifications/{id}`

Messaging:

- `POST /api/messages/send` — `{ senderId, receiverId, subject?, content, parentMessageId? }` (`201`).
- `GET /api/messages/inbox/{userId}`, `/sent/{userId}`, `/starred/{userId}`, `/archived/{userId}`, `/thread/{parentMessageId}`
- `GET /api/messages/{id}`, `GET /api/messages/unread/{userId}/count`
- `PATCH /api/messages/{id}/read/{receiverId}`, `/{id}/star/{receiverId}`, `/{id}/archive/{receiverId}`
- `DELETE /api/messages/{messageId}/receiver/{receiverId}`

## 6. Example Frontend Integration (Axios)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:8080/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  localStorage.setItem("access_token", data.token);
  return data;
}

export async function fetchStudents(params = { page: 0, size: 20 }) {
  const { data } = await api.get("/students", { params });
  return data;
}

export async function createStudent(payload) {
  const { data } = await api.post("/students", payload);
  return data;
}

export async function createAttendance(payload) {
  // payload: { studentId, sessionId, classGroupId, attendanceDate, status }
  const { data } = await api.post("/attendance", payload);
  return data;
}

export async function bulkUpdateAttendance(updates) {
  // updates: [{ attendanceId, status }, ...]
  const { data } = await api.patch("/attendance/bulk-update", { updates });
  return data;
}
```

## 7. Error Handling

Common API error patterns and suggested frontend behavior.

### 400 Bad Request (Validation)

```json
{
  "timestamp": "2026-03-23T10:22:11.121Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/students"
}
```

Frontend action:

- Show field-level validation messages.
- Do not retry automatically.

### 401 Unauthorized (Authentication)

```json
{
  "timestamp": "2026-03-23T10:25:31.999Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "path": "/api/attendance"
}
```

Frontend action:

- Redirect to login.
- Clear stored token.

### 403 Forbidden (Authorization)

```json
{
  "timestamp": "2026-03-23T10:28:02.220Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/api/admin"
}
```

Frontend action:

- Show permission message.
- Hide unauthorized UI actions.

### 500 Internal Server Error

```json
{
  "timestamp": "2026-03-23T10:29:13.550Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Unexpected server error",
  "path": "/api/students"
}
```

Frontend action:

- Show friendly fallback message.
- Log technical details for debugging.
- Retry only for safe/idempotent operations.

## 8. Best Practices

- Always call APIs through the Gateway base URL.
- Always include JWT in `Authorization` header for protected routes.
- Centralize API client setup (interceptors, timeout, error normalization).
- Handle pagination and empty states explicitly in UI.
- Add retry logic only for transient failures (timeouts, network errors, 502/503).
- Keep endpoint paths in one constants file to avoid typos.
- Never expose secrets in frontend source code.

## 9. Development Tips

### Local environment setup

Create frontend env file:

```env
BASE_URL=http://localhost:8080/api
```

### Test with Postman

1. Login with `POST /api/auth/login`.
2. Copy JWT token from response.
3. Set Postman Authorization type to Bearer Token.
4. Test protected endpoints like `/api/students` and `/api/instructors`.

### Mock API responses

For isolated frontend development, use one of:

- Mock Service Worker (MSW)
- MirageJS
- Axios mock adapter

Mocking recommendations:

- Mirror real gateway paths (`/api/...`).
- Include realistic pagination payloads.
- Include 400/401/403/500 mock cases to test error UI.

---

# Backend: services, configuration & operations

## Services and ports

| Component | Port | Role |
|-----------|------|------|
| API Gateway | 8080 | Single entry point; JWT validation, role checks, CORS, routing |
| Eureka | 8761 | Service discovery |
| Config Server | 8888 | Present but disabled by clients (`spring.cloud.config.enabled=false`) |
| identity-service | 8084 | Auth, JWT issuance, user management |
| education-core-service | 8085 | Students, instructors, attendance, grades, reports, sessions, managers, validation, discipline, audit |
| communication-hub-service | 8091 | Messaging / notifications (persisted) |
| PostgreSQL | 5432 | `identity_db`, `education_core_db`, `communication_hub_db` |
| Kafka | 9092 | Domain & provisioning events |

Only the gateway (8080) should be exposed to clients; the services trust the
gateway but also enforce authentication themselves.

## Running locally

```bash
cp .env.example .env
# Generate strong secrets (required):
#   openssl rand -hex 32   -> JWT_SECRET
#   openssl rand -hex 32   -> INTERNAL_API_KEY
#   set a strong ADMIN_BOOTSTRAP_PASSWORD too (see below)
docker compose up --build
```

`docker-compose.yml` fails fast if `JWT_SECRET`, `INTERNAL_API_KEY`, or
`ADMIN_BOOTSTRAP_PASSWORD` are unset, and identity-service refuses to start
under the `docker`/`prod` profiles if a secret is blank, too short, or a known
placeholder.

## Required configuration

| Variable | Used by | Notes |
|----------|---------|-------|
| `JWT_SECRET` | identity, gateway, education-core, communication-hub | HS256 signing/validation key; must be identical across all four. `openssl rand -hex 32`. |
| `JWT_EXPIRATION` | identity | Token lifetime in ms (default 86400000 = 24 h). |
| `INTERNAL_API_KEY` | identity, education-core | Shared secret sent as `X-Internal-Api-Key` so services may provision privileged roles (`MANAGER`/`INSTRUCTOR`). The gateway strips this header from external traffic. |
| `ADMIN_BOOTSTRAP_USERNAME` / `_EMAIL` / `_PASSWORD` | identity | First-boot ADMIN account, created only if no ADMIN exists yet (see below). |
| `CORS_ALLOWED_ORIGINS` | gateway, education-core | Comma-separated explicit origins (never `*` with credentials). Default `http://localhost:*`. |
| `SPRING_DATASOURCE_*` | identity, education-core, communication-hub | PostgreSQL connection. |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | all | Kafka brokers. |

Secrets must never be committed. `.env` is git-ignored; inject real values from a
secret manager (Vault, AWS/GCP Secrets Manager, Kubernetes Secrets) in
staging/production.

## Security model (summary)

- **Authentication**: HS256 JWT issued by identity-service; validated at the
  gateway and independently by each business service (no gateway bypass).
- **Authorization**: role rules at the gateway (403 on mismatch) and in the
  services (URL rules today; method-level `@PreAuthorize` can be layered on).
- **Registration**: `POST /api/auth/register` self-service is limited to
  `STUDENT`; privileged roles require the internal API key or the ADMIN-only
  `POST /api/users`.
- **First-boot ADMIN**: since self-service registration can't create an ADMIN,
  identity-service creates one automatically on startup *only if no ADMIN
  exists yet* (`AdminBootstrapRunner`), using `ADMIN_BOOTSTRAP_USERNAME` /
  `_EMAIL` / `_PASSWORD`. The account's `mustChangePassword` is always forced
  to `true`, so log in once and immediately call
  `POST /api/auth/change-password`.

## Database & migrations (Flyway)

- Schema is versioned with **Flyway** under `src/main/resources/db/migration`
  in **identity-service**, **education-core-service**, and
  **communication-hub-service** (`V1__…`, `V2__…`). `database/init-all-databases.sql`
  only creates the three empty databases (`identity_db`, `education_core_db`,
  `communication_hub_db`) — it deliberately creates no tables, so the schema
  can never drift from Flyway/the JPA entities.
- Flyway runs automatically on startup (`baseline-on-migrate` adopts pre-existing
  databases). Add new changes as new `V<n>__description.sql` files — never edit an
  applied migration.
- `spring.jpa.hibernate.ddl-auto` should be `validate`/`none` in real
  environments (Hibernate must not own the schema).

## Testing

```bash
# Per module:
mvn -q test                 # unit + integration (H2, Flyway disabled in tests)
```

Current coverage focuses on the security guard (registration roles) and the
provisioning/transaction use cases; see `AUDIT_REPORT.md` for the full quality
assessment and remaining roadmap.
