import { expect, Page } from '@playwright/test';

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'admin';

async function submitLogin(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/index.php');

  const alreadyLogged = page
    .getByRole('link', { name: /Logout|Log out|Cerrar sesión/i })
    .or(page.getByRole('button', { name: /Logout|Log out|Cerrar sesión/i }));

  if (await alreadyLogged.count()) {
    return;
  }

  const usernameField = page.locator('input[name="username"], input[name="user"]');
  await expect(usernameField).toBeVisible();
  await usernameField.fill(username);

  const passwordField = page.locator('input[name="password"], input[type="password"]');
  await expect(passwordField).toBeVisible();
  await passwordField.fill(password);

  await Promise.any([
    page.getByRole('button', { name: /Login|Log in|Connexion|Entrar|Conectar/i }).click(),
    page.locator('input[type="submit"][name="login"], input[type="submit"][value*="Login" i]').click(),
  ]).catch(async () => {
    await page.keyboard.press('Enter');
  });

  await expect(
    page.getByRole('link', { name: /Home|Inicio/i }).first().or(page.locator('#mainmenu'))
  ).toBeVisible({ timeout: 20_000 });
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await submitLogin(page, ADMIN_USER, ADMIN_PASS);
}

export async function ensureModuleEnabled(page: Page, moduleId: string): Promise<void> {
  await loginAsAdmin(page);
  await page.goto('/admin/modules.php?mode=search');

  const enableSelector = `a[href*="action=activate"][href*="value=${moduleId}"]`;
  const disableSelector = `a[href*="action=disable"][href*="value=${moduleId}"]`;

  const enableLink = page.locator(enableSelector).first();
  if (await enableLink.isVisible()) {
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('admin/modules.php') && response.request().method() === 'GET'
      ),
      enableLink.click(),
    ]);
  }

  await expect(page.locator(disableSelector).first()).toBeVisible({ timeout: 10_000 });
}

export async function resetSearchFilters(page: Page): Promise<void> {
  const clearFilterButton = page
    .getByRole('button', { name: /Reset|Clear|Limpiar/i })
    .or(page.getByRole('link', { name: /Reset|Clear|Limpiar/i }));
  if (await clearFilterButton.count()) {
    await clearFilterButton.first().click();
  }
}
