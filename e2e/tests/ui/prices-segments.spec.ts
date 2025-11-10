import { expect, test } from '@playwright/test';
import { login, openMainMenu, selectOption, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-006/HU-007 – Multiprecios por segmento', () => {
  test('aplica precios diferenciados por segmento de cliente', async ({ page }) => {
    await login(page);
    await openMainMenu(page, /Products|Productos/i);

    const reference = uniqueRef('QA-SEG');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Multiprecio');
    await page.getByLabel(/Reference|Referencia/i).fill(reference);
    await page.getByRole('textbox', { name: /Selling price|Precio de venta/i }).fill('100');
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();

    await page.getByRole('link', { name: /Price by customer segment|Segmentos/i }).click();
    await selectOption(page, 'select[name="id_segment"]', '1');
    await page.locator('input[name="price"]:visible').fill('90');
    await page.getByRole('button', { name: /Add|Agregar/i }).click();

    await selectOption(page, 'select[name="id_segment"]', '2');
    await page.locator('input[name="price"]:visible').fill('80');
    await page.getByRole('button', { name: /Add|Agregar/i }).click();

    const rows = page.locator('table.list tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(2);
    await expect(rows.nth(0)).toContainText('Segment 1');
    await expect(rows.nth(1)).toContainText('Segment 2');
  });
});
