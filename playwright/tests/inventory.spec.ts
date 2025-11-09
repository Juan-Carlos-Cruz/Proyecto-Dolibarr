import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';

const inventoryScenarios = [
  { movement: 'Entrada', buttonPattern: /Entrada|Stock in|Receive/i, quantity: 10 },
  { movement: 'Salida', buttonPattern: /Salida|Stock out|Dispatch/i, quantity: 5 },
  { movement: 'Transferencia', buttonPattern: /Transferencia|Transfer/i, quantity: 3 }
];

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;
const STOCK_MODULE_PATTERN = /(Stock management)|(Gestión de stocks)|(Almac[eé]n)/i;

test.describe('HU-025 al HU-028 inventario y documentos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await ensureModuleActivated(page, STOCK_MODULE_PATTERN);
    await page.goto('/');
  });

  test('PF-009: adjuntar documentos al producto', async ({ page }) => {
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: /Producto QA 1|PROD-/i }).first().click();
    await page.getByRole('link', { name: /Documentos|Documents/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      { name: 'ficha-tecnica.pdf', mimeType: 'application/pdf', buffer: Buffer.from('QA') },
      { name: 'foto.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('QA') }
    ]);
    await page.getByLabel(/Categoría|Category/i).selectOption([
      { label: 'Documentación' },
      { label: 'Documentation' }
    ]);
    await page.getByRole('button', { name: /Subir|Upload/i }).click();
    await expect(page.getByRole('link', { name: /ficha-tecnica.pdf/i })).toBeVisible();
  });

  test('PF-010: consulta de niveles por almacén', async ({ page }) => {
    await page.getByRole('link', { name: /Almacén|Stock/i }).click();
    await page.getByRole('button', { name: /Inventario|Inventory/i }).click();
    await page.getByLabel(/Almac[eé]n|Warehouse/i).selectOption('Central');
    await page.getByRole('button', { name: /Buscar|Search/i }).click();
    await expect(page.getByRole('table')).toContainText(/Central/);
    await expect(page.getByRole('table')).toContainText(/Producto QA/);
  });

  for (const scenario of inventoryScenarios) {
    test(`PF-011: registrar movimiento ${scenario.movement}`, async ({ page }) => {
      await page.getByRole('link', { name: /Almacén|Stock/i }).click();
      await page.getByRole('link', { name: /Movimientos/i }).click();
      await page.getByRole('button', { name: scenario.buttonPattern }).click();
      await page.getByRole('textbox', { name: /Producto|Product/i }).fill('Producto QA 1');
      await page.getByRole('option', { name: /Producto QA 1/ }).click();
      await page.getByLabel(/Cantidad|Quantity/i).fill(scenario.quantity.toString());
      await page.getByLabel(/Motivo|Reason/i).fill(`QA ${scenario.movement}`);
      await page.getByRole('button', { name: /Registrar|Record/i }).click();
      await expect(page.getByRole('table')).toContainText(`QA ${scenario.movement}`);
    });
  }
});
