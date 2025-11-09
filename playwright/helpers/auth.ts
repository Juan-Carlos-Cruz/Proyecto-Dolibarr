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

export async function ensureModuleActivated(page: Page, moduleName: string | RegExp) {
  const modulePattern = typeof moduleName === 'string' ? new RegExp(moduleName, 'i') : moduleName;

  await page.getByRole('link', { name: /Configuración|Setup/i }).click();
  await page.getByRole('link', { name: /Módulos|Modules/i }).click();

  const moduleCard = page
    .locator('article.module, div.moduledesclist, div.moduledesclistcard, div.module-card')
    .filter({ hasText: modulePattern })
    .first();

  await expect(moduleCard, `No se encontró el módulo que coincide con ${modulePattern}`).toBeVisible();

  const checkboxToggle = moduleCard.locator('input[type="checkbox"], input[type="radio"]').first();
  const disableControl = moduleCard.locator('button:has-text(/Desactivar|Disable|Deactivate/i), a:has-text(/Desactivar|Disable|Deactivate/i)');
  const enableControl = moduleCard.locator('button:has-text(/Activar|Activate|Enable/i), a:has-text(/Activar|Activate|Enable/i), input[type="submit"][value*="Activar"], input[type="submit"][value*="Enable"], input[type="submit"][value*="Activate"]');

  let isActive = false;

  if ((await checkboxToggle.count()) > 0) {
    isActive = await checkboxToggle.isChecked();
    if (!isActive) {
      await checkboxToggle.check();
      const saveButton = moduleCard.locator('button:has-text(/Guardar|Save/i), input[type="submit"][value*="Guardar"], input[type="submit"][value*="Save"]');
      if ((await saveButton.count()) > 0) {
        await saveButton.first().click();
      }
      isActive = true;
    }
  } else if ((await disableControl.count()) > 0) {
    isActive = await disableControl.first().isVisible();
  }

  if (!isActive && (await enableControl.count()) > 0) {
    await enableControl.first().click();
    const confirmButton = page.locator('button:has-text(/Guardar|Save|Confirmar|Confirm/i), input[type="submit"][value*="Guardar"], input[type="submit"][value*="Save"], a:has-text(/Guardar|Save|Confirmar|Confirm/i)').first();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    isActive = true;
  }

  if ((await checkboxToggle.count()) > 0) {
    await expect(checkboxToggle).toBeChecked();
  } else {
    await expect(disableControl.first()).toBeVisible();
  }

  await page.goto('/');
}
