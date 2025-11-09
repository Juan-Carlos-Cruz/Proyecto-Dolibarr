import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

const uniqueLabel = () => `Producto filtro ${Date.now()}`;

async function createProduct(page: import('@playwright/test').Page, label: string) {
  await page.goto('/product/card.php?action=create&type=0');
  const ref = `LIST-${Date.now()}-${Math.floor(Math.random() * 100)}`;
  await page.locator('input[name="ref"]').fill(ref);
  await page.locator('input[name="label"]').fill(label);
  await Promise.any([
    page.getByRole('button', { name: /Create|Save|Guardar/i }).click(),
    page.locator('input[type="submit"][name="save"]').click(),
  ]);
  await expect(page.locator('div.ok, div.msg-ok').first()).toBeVisible();
  return ref;
}

test.describe.serial('HU-017 Listado de productos', () => {
  let targetLabel: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');
    targetLabel = uniqueLabel();
    await createProduct(page, targetLabel);
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('PF-004: filtrar y ordenar listado por etiqueta', async ({ page }) => {
    await page.goto('/product/list.php');

    await page.locator('input[name="search_label"]').fill(targetLabel);
    await Promise.any([
      page.getByRole('button', { name: /Search|Filtrar|Rechercher/i }).click(),
      page.locator('input[type="submit"][name="button_search"]').click(),
    ]);

    const rows = page.locator('table.liste tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(targetLabel);

    const orderLink = page.locator('a[href*="sortfield=label"]');
    await orderLink.first().click();
    await orderLink.first().click();

    await expect(page.locator('table.liste')).toBeVisible();
  });

  test('PF-004: seleccionar elementos por página', async ({ page }) => {
    await page.goto('/product/list.php');

    const pagination = page.locator('select[name="limit"]');
    if (await pagination.isVisible()) {
      await pagination.selectOption('25');
      await expect(page).toHaveURL(/limit=25/);
    }

    await expect(page.locator('table.liste tbody tr')).not.toHaveCount(0);
  });
});
