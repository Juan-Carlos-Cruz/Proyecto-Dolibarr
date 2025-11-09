import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

test.describe('HU-025 a HU-028 Inventario', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');
  });

  test('PF-010: consulta de inventario por almacén', async ({ page }) => {
    await page.goto('/product/stock/index.php');
    await expect(page.locator('form[name="liststock"], form[action*="stock/index.php"]')).toBeVisible();
    await expect(page.locator('table.liste, table.tagtable')).toBeVisible();
  });

  test('PF-011: formulario de movimientos disponible', async ({ page }) => {
    await page.goto('/product/stock/movement.php?action=create');
    await expect(page.locator('form[name="createmovement"], form[action*="movement.php"]')).toBeVisible();
    await expect(page.locator('select[name="fk_product"], input[name="fk_product"]')).toBeVisible();
  });

  test('PF-009: adjuntos disponibles en ficha de producto', async ({ page }) => {
    await page.goto('/product/list.php');
    const firstProductLink = page.locator('table.liste tbody tr td a').first();
    await firstProductLink.click();
    await page.locator('a[href*="tab=document"]').first().click();
    await expect(page.locator('form[action*="document.php"] input[type="file"]')).toBeVisible();
  });
});
