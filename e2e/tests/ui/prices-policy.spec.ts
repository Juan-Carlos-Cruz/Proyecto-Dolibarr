import { expect, test } from '@playwright/test';
import { login, openMainMenu, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-021/HU-022 – Gestión de precios de venta', () => {
  test('consulta histórico y modifica precio/IVA respetando límites', async ({ page }) => {
    await login(page);
    await openMainMenu(page, /Products|Productos/i);

    const reference = uniqueRef('QA-PRICE');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Precio Venta');
    await page.getByLabel(/Reference|Referencia/i).fill(reference);
    await page.getByRole('textbox', { name: /Selling price|Precio de venta/i }).fill('150');
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();
    await expect(page.getByText(reference)).toBeVisible();

    await page.getByRole('link', { name: /Selling price|Precio de venta/i }).click();
    await expect(page.getByRole('heading', { name: /Selling price history|Histórico/i })).toBeVisible();

    const vatInput = page.locator('input[name="tvat"], select[name="tvat"]');
    if (await vatInput.isVisible().catch(() => false)) {
      await vatInput.fill('19');
    }
    await page.locator('input[name="price"]').fill('200');
    await page.getByRole('button', { name: /Modify|Modificar/i }).click();

    await expect(page.locator('.pricehistory')).toContainText('200');

    await page.locator('input[name="price"]').fill('-1');
    await page.getByRole('button', { name: /Modify|Modificar/i }).click();
    await expect(page.locator('.error, .alert-danger')).toContainText(/price|precio/i);
  });
});
