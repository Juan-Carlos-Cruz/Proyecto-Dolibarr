import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

const uniqueRef = (type: string) => `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

async function createItem(page: import('@playwright/test').Page, type: 'product' | 'service') {
  const ref = uniqueRef(type === 'product' ? 'PROD' : 'SERV');
  const typeParam = type === 'product' ? 0 : 1;

  await page.goto(`/product/card.php?action=create&type=${typeParam}`);

  await page.locator('input[name="ref"]').fill(ref);
  await page.locator('input[name="label"]').fill(`${type === 'product' ? 'Producto' : 'Servicio'} QA ${ref}`);

  if (type === 'product') {
    const weightField = page.locator('input[name="weight"], input[name="weight_kg"]').first();
    if (await weightField.isVisible()) {
      await weightField.fill('0.2');
    }
  }

  await Promise.any([
    page.getByRole('button', { name: /Create|Save|Guardar/i }).click(),
    page.locator('input[type="submit"][name="save"]').click(),
  ]);

  await expect(page.locator('div.ok, div.msg-ok').first()).toBeVisible();
  return ref;
}

test.describe.serial('HU-003 Visibilidad en Stock/Shipment', () => {
  let productRef: string;
  let serviceRef: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');
    productRef = await createItem(page, 'product');
    serviceRef = await createItem(page, 'service');
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('PF-003: productos aparecen en stock', async ({ page }) => {
    await page.goto(`/product/stock/index.php?search_ref=${productRef}`);
    await expect(page.locator('table.liste tbody tr').filter({ hasText: productRef })).toHaveCount(1);
  });

  test('PF-003: servicios no aparecen en stock', async ({ page }) => {
    await page.goto(`/product/stock/index.php?search_ref=${serviceRef}`);
    await expect(page.locator('table.liste tbody tr').filter({ hasText: serviceRef })).toHaveCount(0);
  });
});
