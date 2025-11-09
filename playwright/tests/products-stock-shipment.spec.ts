import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('HU-003 Stock vs Shipment visibility', () => {
  test('PF-003: verificar visibilidad de productos y servicios', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Almacén|Stock/i }).click();
    await expect(page.locator('#id-right table')).toContainText(/Producto QA/);
    await expect(page.locator('#id-right table')).not.toContainText(/Servicio QA/);
  });
});
