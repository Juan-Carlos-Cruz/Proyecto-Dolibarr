import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';
import { segmentMatrix } from '../fixtures/test-data';

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;
const THIRD_PARTIES_PATTERN = /(Third parties)|(Terceros)/i;

test.describe('HU-017 listados de productos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await ensureModuleActivated(page, THIRD_PARTIES_PATTERN);
    await page.goto('/');
  });

  for (const view of ['lista', 'rejilla']) {
    for (const order of ['ASC', 'DESC']) {
      test(`PF-004: filtrar vista ${view} orden ${order}`, async ({ page }) => {
        await page.getByRole('link', { name: /Productos|Products/i }).click();
        await page.getByRole('button', { name: /Filtros|Filters/i }).click();
        await page.getByLabel(/Etiqueta|Label/i).fill('Producto QA');
        await page.getByLabel(/Orden|Order/i).selectOption(order);
        await page.getByRole('button', { name: /Aplicar|Apply/i }).click();
        if (view === 'rejilla') {
          await page.getByRole('link', { name: /Vista rejilla|Card view/i }).click();
        } else {
          await page.getByRole('link', { name: /Vista lista|List view/i }).click();
        }
        const firstLink = page.getByRole('link', { name: /PROD-/i }).first();
        await expect(firstLink).toBeVisible();
        await firstLink.click();
        await expect(page.getByRole('heading', { name: /Producto QA/ })).toBeVisible();
      });
    }
  }

  test('PF-007: multiprecios por segmento en documento de venta', async ({ page }) => {
    for (const segment of segmentMatrix) {
      await page.getByRole('link', { name: /Terceros|Third parties/i }).click();
      await page.getByRole('button', { name: /Nuevo tercero|New third party/i }).click();
      await page.getByLabel(/Nombre|Name/i).fill(`Cliente segmento ${segment}`);
      await page.getByLabel(/Segmento|Segment/i).selectOption(segment.toString());
      await page.getByRole('button', { name: /Crear|Create/i }).click();
      await expect(page.getByRole('heading', { name: /Cliente segmento/ })).toBeVisible();
      await page.getByRole('link', { name: /Crear presupuesto|New proposal/i }).click();
      await page.getByRole('button', { name: /Añadir línea|Add line/i }).click();
      await page.getByRole('textbox', { name: /Producto|Product/i }).fill('PROD-');
      await page.getByRole('option', { name: /Producto QA/ }).first().click();
      await page.getByRole('button', { name: /Añadir|Add/i }).click();
      await expect(page.getByText(/Precio segmento|Segment price/i)).toContainText(segment.toString());
      await page.getByRole('link', { name: /Terceros|Third parties/i }).click();
    }
  });
});
