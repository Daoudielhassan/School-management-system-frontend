import { test, expect } from '@playwright/test';
import { loginViaUI, createStudentViaAdminUI } from './helpers';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@sms.local';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

// A fresh account always has mustChangePassword=true (see AdminBootstrapRunner
// and CreateStudentUseCase), so middleware.ts redirects to /change-password
// before the role dashboard on first login — both are valid, secure outcomes.
// Only a stale/already-used dev database would skip straight to the dashboard.

test('an ADMIN logs in and reaches the admin area (dashboard or forced password change)', async ({ page }) => {
  test.skip(!ADMIN_PASSWORD, 'Set E2E_ADMIN_PASSWORD to the real seeded admin password to run this test');

  await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD!);

  await expect(page).toHaveURL(/\/(admin|change-password)/);
});

test('a STUDENT logs in and reaches their own area, never a different dashboard', async ({ page, context }) => {
  test.skip(!ADMIN_PASSWORD, 'Set E2E_ADMIN_PASSWORD to the real seeded admin password to run this test');

  await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD!);

  const unique = Date.now();
  const { email, temporaryPassword } = await createStudentViaAdminUI(page, {
    firstName: 'Yassine',
    lastName: `E2E-${unique}`,
    email: `yassine.e2e.${unique}@example.com`,
  });

  await context.clearCookies();
  await loginViaUI(page, email, temporaryPassword);

  await expect(page).toHaveURL(/\/(student|change-password)/);
  await expect(page).not.toHaveURL(/\/(admin|manager|professor)/);
});
