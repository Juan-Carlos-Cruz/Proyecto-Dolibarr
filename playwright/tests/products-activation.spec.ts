import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

const MODULES = {
  products: { id: 'modProduct', path: '/product/list.php', heading: /Products/i },
  bom: { id: 'modBom', path: '/bom/index.php', heading: /Bills of Materials|BOM/i },
  stock: { id: 'modProduct', path: '/product/stock/index.php', heading: /Stock/i },
  variants: { id: 'modVariants', path: '/variants/index.php', heading: /Variants|Attributes/i },
};

test.describe('HU-001 Activación de módulos Dolibarr v22', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const [key, module] of Object.entries(MODULES)) {
    test(`PF-001: habilitar módulo ${key}`, async ({ page }) => {
      await ensureModuleEnabled(page, module.id);
      await page.goto(module.path);
      await expect(
        page.locator('h1, h2, header h1, header h2').filter({ hasText: module.heading })
      ).toBeVisible();
    });
  }

  test('PF-003: tablero de stock refleja productos existentes', async ({ page }) => {
    await ensureModuleEnabled(page, MODULES.stock.id);
    await page.goto('/product/stock/index.php');
    await expect(page.locator('table.liste, table.tagtable').first()).toBeVisible();
  });

  test('PF-012: módulo BOM permite crear borrador', async ({ page }) => {
    await ensureModuleEnabled(page, MODULES.bom.id);
    await page.goto('/bom/index.php?action=create');
    await expect(page.locator('form#formBOM, form[name="create"]')).toBeVisible();
  });
});
