import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  if (await page.getByLabel(/Login|Usuario/i).isVisible()) {
    await page.getByLabel(/Login|Usuario/i).fill(process.env.ADMIN_USER || 'admin');
    await page.getByLabel(/Password|Contraseña/i).fill(process.env.ADMIN_PASS || 'admin');
    await page.getByRole('button', { name: /Login|Conectar|Entrar/i }).click();
  }
  await expect(page.getByRole('link', { name: /Inicio|Home/i })).toBeVisible();
}

export async function ensureModuleActivated(page: Page, moduleName: string) {
  await page.getByRole('link', { name: /Configuración|Setup/i }).click();
  await page.getByRole('link', { name: /Módulos/i }).click();
  const moduleCard = page.locator('article.module', { hasText: moduleName });
  const isActive = await moduleCard.locator('text=/Activo|Enabled/i').count();
  if (!isActive) {
    await moduleCard.getByRole('button', { name: /Activar|Enable/i }).click();
    await moduleCard.getByRole('button', { name: /Guardar|Save/i }).click();
  }
  await expect(moduleCard).toContainText(/Activo|Enabled/i);
}
