import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

test.describe('HU-010 a HU-014 Bill of Materials', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');
    await ensureModuleEnabled(page, 'modBom');
  });

  test('PF-012: formulario de creación de BOM disponible', async ({ page }) => {
    await page.goto('/bom/card.php?action=create');
    await expect(page.locator('form[name="create"], form#formBOM')).toBeVisible();
    await expect(page.locator('input[name="ref"], input[name="bom_ref"]')).toBeVisible();
  });
});
