# Admin features awaiting a backend contract

Three admin pages have a complete frontend (UI, forms, hooks) but **no matching
backend endpoint exists anywhere** in `API_REFERENCE_backend.md` — the only
real route under `/api/admin/**` is `GET /api/admin/stats`. Their API layers
(`src/features/{backups,config,permissions}/api/*.api.ts`) are stubbed to
return empty lists / throw a clear "not implemented" error, so the UI degrades
predictably instead of silently 404ing. This doc specifies what each backend
route would need to look like to wire them up for real.

---

## 1. Backups (`src/features/backups/`)

UI: list of backups (stats: count / last backup / total size), "Create Backup"
button, "Restore" with confirmation.

Frontend type (`types.ts`):
```ts
interface Backup {
  id: string;
  filename: string;
  size: number;      // bytes
  createdAt: string; // ISO instant
  status: string;
  type: string;
}
```

Proposed contract (education-core-service or a new ops service, `ADMIN` role):

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/admin/backups` | — | `Backup[]` |
| POST | `/api/admin/backups` | — | `Backup` (201) |
| POST | `/api/admin/backups/{id}/restore` | — | 200 / 202 if async |

## 2. System Config (`src/features/config/`)

UI: settings grouped by category, edit one value at a time.

Frontend type:
```ts
interface SystemConfig {
  key: string;
  value: string;
  description: string;
  category: string;
}
```

Proposed contract (`ADMIN` role):

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/admin/config` | — | `SystemConfig[]` |
| PUT | `/api/admin/config/{key}` | `{ "value": string }` | `SystemConfig` |

## 3. Permissions (`src/features/permissions/`)

UI: read-only matrix of permissions grouped by role (`ADMIN`, `MANAGER`,
`INSTRUCTOR`, `STUDENT` — see `User.UserRole`).

Frontend type:
```ts
interface Permission {
  id: number;
  role: string;
  resource: string;
  actions: string[]; // e.g. ["READ", "WRITE", "DELETE"]
}
```

Today role → access is **hardcoded** at the gateway/service level (see
`API_REFERENCE_backend.md` §0.3), not data-driven, so this needs an actual
RBAC table before an endpoint can back it meaningfully:

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/admin/permissions` | — | `Permission[]` |

---

Once any of these land, replace the corresponding `api/*.api.ts` body with a
real `apiGet`/`apiPost`/`apiPut` call — the hooks and components are already
built against these exact shapes and need no other changes.
