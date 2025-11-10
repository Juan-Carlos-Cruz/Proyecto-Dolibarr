import { expect, test } from '@playwright/test';
import { login, openMainMenu, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-010–HU-014 – Bill of Materials', () => {
  test('crea una BOM con dos componentes y la valida', async ({ page }) => {
    await login(page);

    await openMainMenu(page, /Products|Productos/i);
    const componentA = uniqueRef('QA-CMP-A');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('Componente A');
    await page.getByLabel(/Reference|Referencia/i).fill(componentA);
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();
    await openMainMenu(page, /Products|Productos/i);
    const componentB = uniqueRef('QA-CMP-B');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('Componente B');
    await page.getByLabel(/Reference|Referencia/i).fill(componentB);
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();

    await openMainMenu(page, /Products|Productos/i);
    const bomRef = uniqueRef('QA-BOM');
    await page.getByRole('link', { name: /New BOM|Nueva BOM/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA BOM Principal');
    await page.getByLabel(/Reference|Referencia/i).fill(bomRef);
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();

    await page.getByRole('button', { name: /Add line|Añadir línea/i }).click();
    await page.getByRole('textbox', { name: /Product|Producto/i }).fill(componentA);
    await page.keyboard.press('Enter');
    await page.locator('input[name="qty"]:visible').fill('2');
    await page.getByRole('button', { name: /Add|Agregar/i }).click();

    await page.getByRole('button', { name: /Add line|Añadir línea/i }).click();
    await page.getByRole('textbox', { name: /Product|Producto/i }).fill(componentB);
    await page.keyboard.press('Enter');
    await page.locator('input[name="qty"]:visible').fill('1');
    await page.getByRole('button', { name: /Add|Agregar/i }).click();

    await expect(page.locator('table.list tbody tr')).toHaveCount(2);
    await page.getByRole('button', { name: /Validate|Validar/i }).click();
    await expect(page.getByText(/Status.*Validated|Estado.*Validada/i)).toBeVisible();
  });
});
