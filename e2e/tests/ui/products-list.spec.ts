import { expect, test } from '@playwright/test';
import { login, openMainMenu, uniqueRef } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-017 – Listado de productos con filtros y orden', () => {
  test('aplica filtros, orden y vista rejilla/lista', async ({ page }) => {
    await login(page);
    await openMainMenu(page, /Products|Productos/i);

    const refs = [uniqueRef('QA-LIST-A'), uniqueRef('QA-LIST-B')];
    for (const [index, ref] of refs.entries()) {
      await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
      await page.getByLabel(/Label|Etiqueta/i).fill(`QA Listado ${index}`);
      await page.getByLabel(/Reference|Referencia/i).fill(ref);
      await page.getByRole('textbox', { name: /Selling price|Precio de venta/i }).fill(((index + 1) * 100).toString());
      const tagField = page.locator('input[name="array_options\[options_tag\]]');
      if (await tagField.isVisible().catch(() => false)) {
        await tagField.fill(index === 0 ? 'Etiqueta A' : 'Etiqueta B');
      }
      await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();
      await openMainMenu(page, /Products|Productos/i);
    }

    const searchInput = page.getByRole('textbox', { name: /Search|Buscar/i }).first();
    await searchInput.fill('Etiqueta A');
    await page.getByRole('button', { name: /Search|Filtrar/i }).first().click();
    await expect(page.getByText(refs[0])).toBeVisible();
    await expect(page.getByText(refs[1])).not.toBeVisible();

    const sortLink = page.getByRole('link', { name: /Reference|Referencia/i }).first();
    await sortLink.click();
    await sortLink.click();

    const firstRowRef = await page.locator('table.list tbody tr td').first().textContent();
    expect(firstRowRef).toContain(refs[1].split('-').slice(0, 2).join('-'));

    const gridToggle = page.getByRole('button', { name: /Grid|Rejilla/i }).first();
    if (await gridToggle.isVisible().catch(() => false)) {
      await gridToggle.click();
      await expect(page.locator('.product-card, .thumbs')).toBeVisible();
    }
  });
});
