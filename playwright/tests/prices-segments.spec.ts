import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

test.describe('HU-006 Multiprecios por segmento', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');
  });

  test('PF-007: opciones de multiprecio visibles en la configuración', async ({ page }) => {
    await page.goto('/admin/module.php?module=modProduct');
    const multipriceOption = page.locator('input[name="options_PRODUIT_MULTIPRICES"], input[name="options_PRODUCT_MULTIPRICES"]');
    await expect(multipriceOption.first()).toBeVisible();
  });
});
