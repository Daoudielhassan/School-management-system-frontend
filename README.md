# AIAC Intranet — Frontend

Web frontend for the school-management system (attendance, grades, students,
messaging, administration). Single-page-style app built on **Next.js 15 (App
Router)**, talking to the microservices backend **only through the API gateway**.

- Backend repo: `Micriservices_absences` (Spring Boot services + gateway). See its
  `ARCHITECTURE.md`.
- The frontend never calls a service port directly — every request goes to the
  gateway (`http://localhost:8080` in local dev).

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS v3, `shadcn/ui` (Radix primitives), `tailwind-merge`, `class-variance-authority` |
| Server state | TanStack Query (`@tanstack/react-query`) |
| Tables | TanStack Table (`@tanstack/react-table`) via a shared `DataTable` |
| Forms | `react-hook-form` + `zod` (`@hookform/resolvers`) |
| HTTP | Native `fetch` wrapper (`src/config/api-http.ts`) + `axios` (interceptors for auth/logging) |
| Calendar | FullCalendar (day/time-grid) for schedules |
| Toasts | `react-toastify` / `sonner` |
| Tests | Vitest + React Testing Library (unit/component), Playwright (E2E) |

UI language is **French**. Two standing conventions enforced across the code:
- **Never show raw IDs/UUIDs** in the UI — always resolve to a human-readable name.
- **French copy everywhere** (labels, toasts, empty states, dialog text).

---

## Project structure

```
src/
├── app/                    # App Router routes, grouped by role
│   ├── login/              # public: login
│   ├── change-password/    # forced first-login password change
│   ├── admin/…             # ADMIN dashboard + feature pages
│   ├── manager/…           # MANAGER pages
│   ├── professor/…         # INSTRUCTOR pages
│   ├── student/…           # STUDENT pages
│   └── unauthorized/       # 403 landing
├── features/               # feature slices (the bulk of the app)
│   └── <feature>/
│       ├── api/            # thin wrappers over the shared HTTP client
│       ├── hooks/          # React Query hooks (queries + mutations)
│       ├── components/     # feature UI
│       └── lib/            # feature-local helpers, selectors
├── components/
│   ├── ui/                 # shadcn/ui primitives (Button, Dialog, Select, …)
│   └── shared/             # cross-feature building blocks
│                           #   PageHeader, DataTable, ConfirmDialog,
│                           #   EntityFormDialog, RecipientPicker, StatTile,
│                           #   SessionCalendar, TemporaryPasswordDialog, …
├── config/                 # API layer
│   ├── api-base.ts         # base URL / config
│   ├── api-endpoints.ts    # ALL endpoint paths (single source of truth)
│   ├── api-http.ts         # fetch wrapper: auth header, retry, error shaping
│   ├── api-health.ts       # gateway/service health checks
│   └── api.ts              # re-exports
├── context/                # React context providers
│   ├── AuthContext.tsx     # token, role, login/logout, token-expiry handling
│   ├── AdminContext.tsx / InstructorContext.tsx / StudentContext.tsx
├── lib/                    # generic utilities (api-error, utils, …)
├── locales/                # fr.json
├── types/                  # shared TS types (auth, …)
├── styles/
└── middleware.ts           # route protection by role (see below)
```

Every feature follows the same **api → hooks → components** slice, so a new screen
is: add endpoint(s) in `config/api-endpoints.ts`, add `api/*.api.ts`, wrap in a
React Query hook, render with shared components.

---

## Auth & routing

- Login (`POST /api/auth/login` through the gateway) returns a JWT. The token,
  `role`, `userId`, and `mustChangePassword` flag are stored in cookies.
- `src/middleware.ts` guards `/student`, `/professor`, `/manager`, `/admin`:
  - no/expired token → redirect to `/login`;
  - `mustChangePassword` → forced to `/change-password`;
  - wrong role for the path → `/unauthorized`.
- Role → home dashboard: `STUDENT → /student`, `INSTRUCTOR → /professor`,
  `MANAGER → /manager`, `ADMIN → /admin`.
- `AuthContext` also validates token expiry periodically and on 401/403 responses.

---

## Running locally

Requires the backend stack to be up (gateway on `:8080`). See the backend repo's
`docker compose up -d`.

```bash
npm install
npm run dev          # http://localhost:3000  (root redirects to /login)
```

Log in with the bootstrapped admin (see backend `.env`:
`ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_PASSWORD`).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`eslint.config.mjs`) |
| `npm run test` | Vitest (unit/component) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E — **needs the backend stack running** |

> Note: the port **3000** is why the backend's Grafana is mapped to **3001** — the
> dev server owns 3000 locally.

---

## Testing

- **Unit/component** (Vitest + RTL): colocated `*.test.tsx` next to the code, e.g.
  `src/components/shared/DataTable.test.tsx`, `RecipientPicker.test.tsx`. These lock
  in cross-cutting rules (French defaults, no-raw-ID). Config in `vitest.config.ts`,
  setup in `vitest.setup.ts`.
- **E2E** (Playwright): `e2e/*.spec.ts` (`auth.spec.ts`, `admin-create-student.spec.ts`).
  They drive real flows against a running backend and are **skipped unless**
  `E2E_ADMIN_PASSWORD` is set. Config in `playwright.config.ts` (starts `npm run dev`).

```bash
# E2E, locally
docker compose up -d           # in the backend repo
npx playwright install --with-deps chromium
E2E_ADMIN_PASSWORD=... npm run test:e2e
```

---

## CI

`.github/workflows/ci.yml` runs on push/PR: `npm ci` → lint (non-blocking) →
`tsc --noEmit` → `build` → `test` (Vitest). E2E is intentionally **not** wired into
CI (it needs the full backend stack); run it locally.

Lint currently carries a large pre-existing backlog, so it runs **non-blocking**
and `next build` skips ESLint (`eslint.ignoreDuringBuilds` in `next.config.ts`).
The real gates are `tsc`, `build`, and Vitest.

---

## Conventions cheat-sheet

- Endpoints live **only** in `src/config/api-endpoints.ts` — never hardcode paths or
  service ports in components.
- Server state goes through **React Query hooks** in `features/<x>/hooks`; components
  don't call `fetch`/`axios` directly.
- Reuse the shared components (`DataTable`, `EntityFormDialog`, `ConfirmDialog`,
  `PageHeader`, `RecipientPicker`, …) rather than re-implementing tables/forms/dialogs.
- French UI text; resolve IDs to names before display.
