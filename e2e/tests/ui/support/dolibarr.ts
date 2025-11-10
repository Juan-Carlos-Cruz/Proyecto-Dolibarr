import { expect, Page } from '@playwright/test';

/**
 * Shared helpers for Dolibarr UI tests. The goal is to keep the interaction
 * layer consistent across specs so that selectors are resilient against
 * translations and small layout variations between minor versions.
 */
export async function login(page: Page) {
  await page.goto('/user/login.php?lang=en_US');
  const loginField = page.locator('input[name="username"], input[name="userlogin"], #username').first();
  const passwordField = page.locator('input[name="password"], #password').first();

  if (!(await loginField.isVisible().catch(() => false))) {
    return; // already logged in via storage state
  }

  await loginField.fill(process.env.DOLI_USER || 'admin');
  await passwordField.fill(process.env.DOLI_PASS || 'admin');
  await page.locator('button[type="submit"], input[type="submit"]').first().click();
  await page.waitForLoadState('networkidle');
  await expect(loginField).not.toBeVisible();
}

export async function openMainMenu(page: Page, menu: RegExp, submenu?: RegExp) {
  const menuLink = page.getByRole('link', { name: menu }).first();
  await expect(menuLink).toBeVisible({ timeout: 20_000 });
  await menuLink.click();

  if (submenu) {
    const subLink = page.getByRole('link', { name: submenu }).first();
    await expect(subLink).toBeVisible({ timeout: 10_000 });
    await subLink.click();
  }
}

export async function enableModule(page: Page, moduleName: RegExp) {
  await openMainMenu(page, /Setup|Configuración/i, /Modules|Módulos/i);
  const card = page.getByRole('button', { name: moduleName }).first();
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();

  const statusBadge = page.locator('span.badge-status, .badge.status');
  const statusText = (await statusBadge.first().textContent())?.toLowerCase() || '';
  if (statusText.includes('enabled') || statusText.includes('activo')) {
    return; // already enabled
  }

  const enableButton = page.getByRole('button', { name: /Enable|Activar/i }).first();
  await expect(enableButton).toBeVisible();
  await enableButton.click();
  const saveButton = page.getByRole('button', { name: /Save|Guardar/i }).first();
  if (await saveButton.isVisible().catch(() => false)) {
    await saveButton.click();
  }
  await expect(statusBadge.first()).toContainText(/Enabled|Activo/i);
}

export async function selectOption(page: Page, selector: string, value: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout: 10_000 });
  await element.selectOption(value);
}

export function uniqueRef(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
}

export async function ensureProductExists(page: Page, opts: {
  ref: string;
  label: string;
  type?: 'product' | 'service';
}) {
  await openMainMenu(page, /Products|Productos/i);
  await page.waitForLoadState('domcontentloaded');

  await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
  await page.getByLabel(/Label|Etiqueta/i).fill(opts.label);
  const typeSelect = page.locator('select[name="type"], #type');
  if (await typeSelect.isVisible().catch(() => false)) {
    await typeSelect.selectOption(opts.type === 'service' ? '1' : '0');
  }
  await page.getByLabel(/Reference|Referencia/i).fill(opts.ref);
  await page.getByRole('textbox', { name: /Selling price|Precio de venta/i }).fill('100');
  await page.getByRole('button', { name: /Create|Guardar|Save/i }).click();
  await expect(page.getByRole('heading', { name: new RegExp(opts.label, 'i') })).toBeVisible();
}
