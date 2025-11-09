import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;
const STOCK_MODULE_PATTERN = /(Stock management)|(Gestión de stocks)|(Almac[eé]n)/i;

test.describe('HU-003 Stock vs Shipment visibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await ensureModuleActivated(page, STOCK_MODULE_PATTERN);
    await page.goto('/');
  });

  test('PF-003: verificar visibilidad de productos y servicios', async ({ page }) => {
    await page.getByRole('link', { name: /Almacén|Stock/i }).click();
    await expect(page.locator('#id-right table')).toContainText(/Producto QA/);
    await expect(page.locator('#id-right table')).not.toContainText(/Servicio QA/);
  });
});
