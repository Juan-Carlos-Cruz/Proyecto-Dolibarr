import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';
import { bomSeeds } from '../fixtures/test-data';

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;
const BOM_MODULE_PATTERN = /(Bill of materials)|(Listas de materiales)/i;

test.describe('HU-010 al HU-014 BOM', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await ensureModuleActivated(page, BOM_MODULE_PATTERN);
    await page.goto('/');
  });

  for (const bom of bomSeeds) {
    test(`PF-012: crear y validar BOM ${bom.reference}`, async ({ page }) => {
      await page.getByRole('link', { name: /Productos|Products/i }).click();
      await page.getByRole('link', { name: /Listas de materiales|BOM/i }).click();
      await page.getByRole('button', { name: /Nueva BOM|New BOM/i }).click();
      await page.getByLabel(/Referencia|Reference/i).fill(bom.reference);
      await page.getByLabel(/Etiqueta|Label/i).fill(bom.label);
      await page.getByRole('button', { name: /Guardar|Save/i }).click();
      for (const line of bom.lines) {
        await page.getByRole('button', { name: /Añadir línea|Add line/i }).click();
        await page.getByRole('textbox', { name: /Producto|Product/i }).fill(line.reference);
        await page.getByRole('option', { name: new RegExp(line.reference) }).click();
        await page.getByLabel(/Cantidad|Quantity/i).fill(line.quantity.toString());
        await page.getByRole('button', { name: /Añadir|Add/i }).click();
      }
      await page.getByRole('button', { name: /Validar|Validate/i }).click();
      await expect(page.getByText(/Estado.*Activado|Status.*Validated/i)).toBeVisible();
      await page.getByRole('link', { name: /.odt/i }).click();
    });
  }
});
