import { expect, test } from '@playwright/test';
import { ensureProductExists, login, openMainMenu, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-003 – Visibilidad en Stock/Shipment', () => {
  test('solo productos físicos aparecen en Stock/Shipment', async ({ page }) => {
    await login(page);

    const productRef = uniqueRef('QA-STK');
    await ensureProductExists(page, { ref: productRef, label: 'QA Stock Producto', type: 'product' });

    await openMainMenu(page, /Products|Productos/i);
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Servicio');
    await page.getByLabel(/Reference|Referencia/i).fill(uniqueRef('QA-SRV'));
    const typeSelect = page.locator('select[name="type"], #type');
    if (await typeSelect.isVisible().catch(() => false)) {
      await typeSelect.selectOption('1');
    }
    await page.getByRole('textbox', { name: /Selling price|Precio de venta/i }).fill('120');
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();
    await expect(page.getByRole('heading', { name: /QA Servicio/i })).toBeVisible();

    await openMainMenu(page, /Stock|Almacén/i, /Shipments|Expediciones|Stocks/i);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(productRef)).toBeVisible();
    await expect(page.getByText('QA Servicio')).not.toBeVisible();
  });
});
