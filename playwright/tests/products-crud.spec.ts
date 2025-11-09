import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';
import { productSeeds } from '../fixtures/test-data';

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;

test.describe('HU-002 Productos físicos CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await page.goto('/');
    await page.getByRole('link', { name: /Productos|Products/i }).click();
  });

  for (const seed of productSeeds.slice(0, 10)) {
    test(`PF-002: crear producto ${seed.reference}`, async ({ page }) => {
      await page.getByRole('button', { name: /Nuevo producto|New product/i }).click();
      await page.getByLabel(/Etiqueta|Label/i).fill(seed.label);
      await page.getByLabel(/Tipo|Type/i).selectOption(seed.type === 'product' ? '0' : '1');
      await page.getByLabel(/Referencia|Ref\./i).fill(seed.reference);
      await page.getByLabel(/Peso|Weight/i).fill(seed.weight.toString());
      await page.getByLabel(/Tamaño|Size/i).fill(seed.size);
      await page.getByLabel(/Código arancelario|HTS/i).fill(seed.hts);
      await page.getByRole('button', { name: /Guardar|Save|Create/i }).click();
      await expect(page.getByRole('heading', { name: seed.label })).toBeVisible();
      await page.getByRole('button', { name: /Modificar|Edit/i }).click();
      await page.getByLabel(/Estado|Status/i).selectOption('0');
      await page.getByRole('button', { name: /Guardar|Save/i }).click();
      await expect(page.getByText(/Status.*(Inactivo|Disabled)/i)).toBeVisible();
    });
  }
});
