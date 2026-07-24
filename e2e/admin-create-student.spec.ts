import { test, expect } from '@playwright/test';
import { loginViaUI, createStudentViaAdminUI } from './helpers';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@sms.local';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test('an admin creates a student end-to-end and sees them in the list', async ({ page }) => {
  test.skip(!ADMIN_PASSWORD, 'Set E2E_ADMIN_PASSWORD to the real seeded admin password to run this test');

  const unique = Date.now();
  const student = {
    firstName: 'Amina',
    lastName: `E2E-${unique}`,
    email: `amina.e2e.${unique}@example.com`,
  };

  await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD!);
  await expect(page).toHaveURL(/\/(admin|change-password)/);

  await createStudentViaAdminUI(page, student);

  // Search narrows the (possibly paginated) directory down to this one student.
  await page.getByPlaceholder("Rechercher par nom, email ou numéro d'étudiant").fill(student.email);
  await expect(page.getByText(`${student.firstName} ${student.lastName}`)).toBeVisible();
  await expect(page.getByText(student.email)).toBeVisible();
});
