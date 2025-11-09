import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';

const vatValues = [0, 0.05, 0.19, 0.25];

const priceMatrix = [
  { base: 100, min: 80 },
  { base: 50, min: 55 }
];

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;

test.describe('HU-021/022 políticas de precios', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await page.goto('/');
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: /Producto QA 1|PROD-/i }).first().click();
    await page.getByRole('link', { name: /Precios|Prices/i }).click();
  });

  for (const vat of vatValues) {
    test(`PF-006: modificar precio base y VAT ${vat}`, async ({ page }) => {
      await page.getByLabel(/Precio base|Base price/i).fill('100');
      await page.getByLabel(/Precio mínimo|Minimum price/i).fill('90');
      await page.getByLabel(/IVA|VAT/i).fill((vat * 100).toString());
      await page.getByRole('button', { name: /Guardar|Save/i }).click();
      if (vat > 0.21) {
        await expect(page.getByText(/fuera de rango|out of range/i)).toBeVisible();
      } else {
        await expect(page.getByText(/Actualizado|Updated|Saved/i)).toBeVisible();
      }
    });
  }

  for (const scenario of priceMatrix) {
    test(`PF-005: consulta historial y precios base/min ${scenario.base}/${scenario.min}`, async ({ page }) => {
      await page.getByRole('button', { name: /Historial|History/i }).click();
      await expect(page.getByRole('table')).toBeVisible();
      await expect(page.getByRole('table')).toContainText(/Usuario|User/i);
      await page.getByLabel(/Precio base|Base price/i).fill(String(scenario.base));
      await page.getByLabel(/Precio mínimo|Minimum price/i).fill(String(scenario.min));
      await page.getByRole('button', { name: /Guardar|Save/i }).click();
      if (scenario.base < scenario.min) {
        await expect(page.getByText(/mínimo|minimum/i)).toBeVisible();
      } else {
        await expect(page.getByText(/Actualizado|Updated|Saved/i)).toBeVisible();
      }
    });
  }
});
