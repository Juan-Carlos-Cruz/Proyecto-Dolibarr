import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

test.describe('HU-008 Variantes de producto', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');
    await ensureModuleEnabled(page, 'modVariants');
  });

  test('PF-008: configuración de atributos disponible', async ({ page }) => {
    await page.goto('/variants/index.php');
    await expect(page.locator('a[href*="action=create"], button[name="add_attribute"]')).toBeVisible();
  });
});
