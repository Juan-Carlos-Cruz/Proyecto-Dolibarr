import { expect, test } from '@playwright/test';
import { login, openMainMenu, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-008 – Gestión de variantes', () => {
  test('crea atributos talla/color y genera variantes', async ({ page }) => {
    await login(page);
    await openMainMenu(page, /Products|Productos/i);

    const reference = uniqueRef('QA-VAR');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Producto Base');
    await page.getByLabel(/Reference|Referencia/i).fill(reference);
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();

    await page.getByRole('link', { name: /Variants|Variantes/i }).click();
    await page.getByRole('button', { name: /New attribute|Nuevo atributo/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('Talla');
    await page.getByRole('button', { name: /Save|Guardar/i }).click();

    await page.getByRole('button', { name: /New value|Nuevo valor/i }).click();
    await page.getByLabel(/Value|Valor/i).fill('S');
    await page.getByRole('button', { name: /Save|Guardar/i }).click();
    await page.getByRole('button', { name: /New value|Nuevo valor/i }).click();
    await page.getByLabel(/Value|Valor/i).fill('M');
    await page.getByRole('button', { name: /Save|Guardar/i }).click();

    await page.getByRole('button', { name: /New attribute|Nuevo atributo/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('Color');
    await page.getByRole('button', { name: /Save|Guardar/i }).click();
    await page.getByRole('button', { name: /New value|Nuevo valor/i }).click();
    await page.getByLabel(/Value|Valor/i).fill('Rojo');
    await page.getByRole('button', { name: /Save|Guardar/i }).click();

    await page.getByRole('button', { name: /Generate combinations|Generar/i }).click();
    await page.getByRole('button', { name: /Validate|Validar/i }).click();

    const variantRows = page.locator('table.list tbody tr');
    const count = await variantRows.count();
    expect(count).toBeGreaterThanOrEqual(2);
    await expect(variantRows.first()).toContainText('Talla S');
  });
});
