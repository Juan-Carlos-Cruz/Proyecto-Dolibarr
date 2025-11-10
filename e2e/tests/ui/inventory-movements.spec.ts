import { expect, test } from '@playwright/test';
import { login, openMainMenu, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-025/HU-026 – Inventario y movimientos', () => {
  test('consulta niveles por almacén y registra movimientos de entrada/salida', async ({ page }) => {
    await login(page);

    await openMainMenu(page, /Products|Productos/i);
    const reference = uniqueRef('QA-INV');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Inventario');
    await page.getByLabel(/Reference|Referencia/i).fill(reference);
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();

    await page.getByRole('link', { name: /Stock|Stock/i }).click();
    await page.getByRole('button', { name: /New movement|Nuevo movimiento/i }).click();
    await page.locator('input[name="qty"]:visible').fill('10');
    await page.locator('textarea[name="label"]:visible').fill('Ingreso inicial');
    await page.getByRole('button', { name: /Create|Guardar/i }).click();

    await expect(page.locator('.boxstats')).toContainText('10');

    await page.getByRole('button', { name: /New movement|Nuevo movimiento/i }).click();
    await page.locator('input[name="qty"]:visible').fill('-5');
    await page.locator('textarea[name="label"]:visible').fill('Salida controlada');
    await page.getByRole('button', { name: /Create|Guardar/i }).click();

    const lines = page.locator('table.list tbody tr');
    await expect(lines.first()).toContainText('Salida controlada');
    await expect(page.locator('.boxstats')).toContainText('5');
  });
});
