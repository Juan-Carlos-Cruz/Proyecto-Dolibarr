import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';
import { segmentMatrix } from '../fixtures/test-data';

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;
const THIRD_PARTIES_PATTERN = /(Third parties)|(Terceros)/i;
const SALES_ORDERS_PATTERN = /(Customer orders)|(Pedidos de clientes)|(Pedidos)/i;

test.describe('HU-006 multiprecios por segmento', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await ensureModuleActivated(page, THIRD_PARTIES_PATTERN);
    await ensureModuleActivated(page, SALES_ORDERS_PATTERN);
    await page.goto('/');
  });

  test('PF-007: validar precios por segmento en pedidos', async ({ page }) => {
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: /Producto QA 1|PROD-/i }).first().click();
    await page.getByRole('link', { name: /Precios especiales|Special prices/i }).click();

    for (const segment of segmentMatrix) {
      await page.getByRole('button', { name: /Añadir precio|Add price/i }).click();
      await page.getByLabel(/Segmento|Segment/i).selectOption(segment.toString());
      await page.getByLabel(/Precio|Price/i).fill((100 + segment * 10).toString());
      await page.getByRole('button', { name: /Guardar|Save/i }).click();
      await expect(page.getByRole('row', { name: new RegExp(`(Segmento|Segment).*${segment}`) })).toBeVisible();
    }

    await page.goto('/');
    await page.getByRole('link', { name: /Terceros|Third parties/i }).click();
    await page.getByRole('button', { name: /Nuevo tercero|New third party/i }).click();
    await page.getByLabel(/Nombre|Name/i).fill('Cliente segmento 1');
    await page.getByLabel(/Segmento|Segment/i).selectOption('1');
    await page.getByRole('button', { name: /Crear|Create/i }).click();

    await page.getByRole('link', { name: /Pedidos/i }).click();
    await page.getByRole('button', { name: /Nuevo pedido|New order/i }).click();
    await page.getByRole('textbox', { name: /Cliente|Customer/i }).fill('Cliente segmento 1');
    await page.getByRole('option', { name: /Cliente segmento 1/ }).click();
    await page.getByRole('button', { name: /Crear|Create/i }).click();
    await page.getByRole('button', { name: /Añadir línea|Add line/i }).click();
    await page.getByRole('textbox', { name: /Producto|Product/i }).fill('Producto QA');
    await page.getByRole('option', { name: /Producto QA/ }).first().click();
    await page.getByRole('button', { name: /Añadir|Add/i }).click();
    await expect(page.getByText(/Segmento 1|Segment 1/i)).toBeVisible();
  });
});
