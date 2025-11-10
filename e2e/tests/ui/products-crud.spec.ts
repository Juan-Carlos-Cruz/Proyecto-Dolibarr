import { expect, test } from '@playwright/test';
import { login, openMainMenu, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-002 – CRUD de productos físicos', () => {
  test('crea, edita y desactiva un producto físico', async ({ page }) => {
    await login(page);
    await openMainMenu(page, /Products|Productos/i);

    const reference = uniqueRef('QA-PF');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Producto físico');
    await page.getByLabel(/Reference|Referencia/i).fill(reference);
    await page.getByLabel(/Type|Tipo/i).selectOption({ value: '0' });
    await page.getByLabel(/Weight/i).fill('0.10');
    await page.getByLabel(/Length|Longitud/i).fill('10');
    await page.getByLabel(/Width|Anchura/i).fill('10');
    await page.getByLabel(/Height|Altura/i).fill('5');
    const hts = page.getByLabel(/Customs|Arancel|HS|HTS/i).first();
    if (await hts.isVisible().catch(() => false)) {
      await hts.fill('1234.56.78');
    }
    await page.getByRole('textbox', { name: /Selling price|Precio de venta/i }).fill('100');
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();

    await expect(page.getByRole('heading', { name: /QA Producto físico/i })).toBeVisible();
    await expect(page.getByText(reference, { exact: false })).toBeVisible();

    await page.getByRole('link', { name: /Modify|Editar/i }).first().click();
    await page.getByLabel(/Weight/i).fill('0.15');
    await page.getByRole('button', { name: /Save|Guardar/i }).click();
    await expect(page.getByText('0.150 kg').first()).toBeVisible({ timeout: 15_000 });

    const statusToggle = page.getByRole('button', { name: /Disable|Desactivar/i });
    await expect(statusToggle).toBeVisible();
    await statusToggle.click();
    await page.getByRole('button', { name: /Confirm|Yes|Sí/i }).first().click();
    await expect(page.getByText(/Status.*Disabled|Estado.*Desactivado/i)).toBeVisible();
  });

  test('rechaza peso negativo y HTS inválido', async ({ page }) => {
    await login(page);
    await openMainMenu(page, /Products|Productos/i);

    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Producto inválido');
    await page.getByLabel(/Reference|Referencia/i).fill(uniqueRef('QA-PF-INV'));
    await page.getByLabel(/Type|Tipo/i).selectOption({ value: '0' });
    await page.getByLabel(/Weight/i).fill('-1');
    const hts = page.getByLabel(/Customs|Arancel|HS|HTS/i).first();
    if (await hts.isVisible().catch(() => false)) {
      await hts.fill('INVALID');
    }

    await page.getByRole('button', { name: /Create|Guardar|Save/i }).click();

    const errorBox = page.locator('.error, .alert-danger').first();
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText(/weight|peso/i);
  });
});
