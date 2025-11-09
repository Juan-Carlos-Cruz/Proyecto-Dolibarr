import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

const inventoryScenarios = [
  { movement: 'Entrada', quantity: 10 },
  { movement: 'Salida', quantity: 5 },
  { movement: 'Transferencia', quantity: 3 }
];

test.describe('HU-025 al HU-028 inventario y documentos', () => {
  test('PF-009: adjuntar documentos al producto', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: /Producto QA 1|PROD-/i }).first().click();
    await page.getByRole('link', { name: /Documentos/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      { name: 'ficha-tecnica.pdf', mimeType: 'application/pdf', buffer: Buffer.from('QA') },
      { name: 'foto.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('QA') }
    ]);
    await page.getByLabel(/Categoría/i).selectOption('Documentación');
    await page.getByRole('button', { name: /Subir/i }).click();
    await expect(page.getByRole('link', { name: /ficha-tecnica.pdf/i })).toBeVisible();
  });

  test('PF-010: consulta de niveles por almacén', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Almacén|Stock/i }).click();
    await page.getByRole('button', { name: /Inventario/i }).click();
    await page.getByLabel(/Almacén/i).selectOption('Central');
    await page.getByRole('button', { name: /Buscar|Search/i }).click();
    await expect(page.getByRole('table')).toContainText(/Central/);
    await expect(page.getByRole('table')).toContainText(/Producto QA/);
  });

  for (const scenario of inventoryScenarios) {
    test(`PF-011: registrar movimiento ${scenario.movement}`, async ({ page }) => {
      await loginAsAdmin(page);
      await page.getByRole('link', { name: /Almacén|Stock/i }).click();
      await page.getByRole('link', { name: /Movimientos/i }).click();
      await page.getByRole('button', { name: new RegExp(scenario.movement, 'i') }).click();
      await page.getByRole('textbox', { name: /Producto/i }).fill('Producto QA 1');
      await page.getByRole('option', { name: /Producto QA 1/ }).click();
      await page.getByLabel(/Cantidad/i).fill(scenario.quantity.toString());
      await page.getByLabel(/Motivo/i).fill(`QA ${scenario.movement}`);
      await page.getByRole('button', { name: /Registrar/i }).click();
      await expect(page.getByRole('table')).toContainText(`QA ${scenario.movement}`);
    });
  }
});
