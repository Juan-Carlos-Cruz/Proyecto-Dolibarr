import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { bomSeeds } from '../fixtures/test-data';

test.describe('HU-010 al HU-014 BOM', () => {
  for (const bom of bomSeeds) {
    test(`PF-012: crear y validar BOM ${bom.reference}`, async ({ page }) => {
      await loginAsAdmin(page);
      await page.getByRole('link', { name: /Productos|Products/i }).click();
      await page.getByRole('link', { name: /Listas de materiales|BOM/i }).click();
      await page.getByRole('button', { name: /Nueva BOM/i }).click();
      await page.getByLabel(/Referencia/i).fill(bom.reference);
      await page.getByLabel(/Etiqueta|Label/i).fill(bom.label);
      await page.getByRole('button', { name: /Guardar/i }).click();
      for (const line of bom.lines) {
        await page.getByRole('button', { name: /Añadir línea/i }).click();
        await page.getByRole('textbox', { name: /Producto/i }).fill(line.reference);
        await page.getByRole('option', { name: new RegExp(line.reference) }).click();
        await page.getByLabel(/Cantidad/i).fill(line.quantity.toString());
        await page.getByRole('button', { name: /Añadir/i }).click();
      }
      await page.getByRole('button', { name: /Validar/i }).click();
      await expect(page.getByText(/Estado.*Activado|Status.*Validated/i)).toBeVisible();
      await page.getByRole('link', { name: /.odt/i }).click();
    });
  }
});
