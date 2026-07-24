import { type Page, expect } from '@playwright/test';

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 });
}

/**
 * Creates a student via the real admin UI at /admin/students (caller must
 * already be logged in as an admin) and returns the one-time temporary
 * password shown in TemporaryPasswordDialog afterward.
 *
 * Locates fields by placeholder rather than label: EntityFormDialog's <Label>
 * has no htmlFor/id pointing at its <Input>, so getByLabel can't resolve them.
 */
export async function createStudentViaAdminUI(
  page: Page,
  { firstName, lastName, email }: { firstName: string; lastName: string; email: string }
) {
  await page.goto('/admin/students');
  await page.getByRole('button', { name: 'Ajouter un étudiant' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('Jean').fill(firstName);
  await dialog.getByPlaceholder('Dupont').fill(lastName);
  await dialog.getByPlaceholder('jean.dupont@exemple.com').fill(email);
  await dialog.getByRole('button', { name: 'Ajouter', exact: true }).click();

  const passwordDialog = page.getByRole('dialog').filter({ hasText: 'Compte créé avec succès' });
  await expect(passwordDialog).toBeVisible({ timeout: 15_000 });
  const temporaryPassword = (await passwordDialog.locator('code').textContent())?.trim();
  if (!temporaryPassword) {
    throw new Error('Temporary password not found in TemporaryPasswordDialog');
  }
  await passwordDialog.getByRole('button', { name: /fermer/i }).click();

  return { email, temporaryPassword };
}
