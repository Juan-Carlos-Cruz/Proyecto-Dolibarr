import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

const uniqueRef = () => `PRICE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

test.describe.serial('HU-021/HU-022 Gestión de precios de venta', () => {
  let productRef: string;
  let productId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');

    productRef = uniqueRef();

    await page.goto('/product/card.php?action=create&type=0');
    await page.locator('input[name="ref"]').fill(productRef);
    await page.locator('input[name="label"]').fill(`Producto precios ${productRef}`);

    const priceField = page.locator('input[name="price"]');
    if (await priceField.isVisible()) {
      await priceField.fill('90');
    }
    const minPriceField = page.locator('input[name="price_min"]');
    if (await minPriceField.isVisible()) {
      await minPriceField.fill('80');
    }
    const vatSelect = page.locator('select[name="tva_tx"]');
    if (await vatSelect.isVisible()) {
      await vatSelect.selectOption('19');
    }
    const vatInput = page.locator('input[name="tva_tx"]');
    if (await vatInput.isVisible()) {
      await vatInput.fill('19');
    }

    await Promise.any([
      page.getByRole('button', { name: /Create|Save|Guardar/i }).click(),
      page.locator('input[type="submit"][name="save"]').click(),
    ]);

    await expect(page.locator('div.ok, div.msg-ok').first()).toBeVisible();
    const url = new URL(page.url());
    productId = url.searchParams.get('id');

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    if (!productId) {
      test.skip('No se obtuvo el ID del producto creado');
    }
    await loginAsAdmin(page);
  });

  test('PF-005: consultar precios de venta e histórico', async ({ page }) => {
    await page.goto(`/product/card.php?id=${productId}&tab=prices`);
    await expect(page.locator('table.liste')).toBeVisible();
    await expect(page.locator('table.liste tbody tr').first()).toContainText(productRef);
  });

  test('PF-006: modificar precio base, mínimo e IVA', async ({ page }) => {
    await page.goto(`/product/card.php?id=${productId}&tab=prices`);

    const newPriceButton = page
      .locator('a[href*="action=add_price"], a[href*="action=create_price"], button[name="add_price"]')
      .first();

    if (await newPriceButton.isVisible()) {
      await newPriceButton.click();
    }

    const priceField = page.locator('input[name="price"]');
    await priceField.fill('120');

    const minPriceField = page.locator('input[name="price_min"]');
    if (await minPriceField.isVisible()) {
      await minPriceField.fill('100');
    }

    const vatSelect = page.locator('select[name="tva_tx"]');
    if (await vatSelect.isVisible()) {
      await vatSelect.selectOption('19');
    }
    const vatInput = page.locator('input[name="tva_tx"]');
    if (await vatInput.isVisible()) {
      await vatInput.fill('19');
    }

    await Promise.any([
      page.getByRole('button', { name: /Save|Validar|Create/i }).click(),
      page.locator('input[type="submit"][name="save"]').click(),
    ]);

    await expect(page.locator('div.ok, div.msg-ok').first()).toBeVisible();
    const historyRow = page.locator('table.liste tbody tr').first();
    await expect(historyRow).toContainText('120');
    await expect(historyRow).toContainText('100');
  });
});
