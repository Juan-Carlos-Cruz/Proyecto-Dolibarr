import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { segmentMatrix } from '../fixtures/test-data';

test.describe('HU-006 multiprecios por segmento', () => {
  test('PF-007: validar precios por segmento en pedidos', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: /Producto QA 1|PROD-/i }).first().click();
    await page.getByRole('link', { name: /Precios especiales/i }).click();

    for (const segment of segmentMatrix) {
      await page.getByRole('button', { name: /Añadir precio/i }).click();
      await page.getByLabel(/Segmento/i).selectOption(segment.toString());
      await page.getByLabel(/Precio/i).fill((100 + segment * 10).toString());
      await page.getByRole('button', { name: /Guardar/i }).click();
      await expect(page.getByRole('row', { name: new RegExp(`Segmento.*${segment}`) })).toBeVisible();
    }

    await page.getByRole('link', { name: /Pedidos/i }).click();
    await page.getByRole('button', { name: /Nuevo pedido/i }).click();
    await page.getByRole('textbox', { name: /Cliente/i }).fill('Cliente segmento');
    await page.getByRole('option', { name: /Cliente segmento 1/ }).click();
    await page.getByRole('button', { name: /Crear/i }).click();
    await page.getByRole('button', { name: /Añadir línea/i }).click();
    await page.getByRole('textbox', { name: /Producto/i }).fill('Producto QA');
    await page.getByRole('option', { name: /Producto QA/ }).first().click();
    await page.getByRole('button', { name: /Añadir/i }).click();
    await expect(page.getByText(/Segmento 1/)).toBeVisible();
  });
});
