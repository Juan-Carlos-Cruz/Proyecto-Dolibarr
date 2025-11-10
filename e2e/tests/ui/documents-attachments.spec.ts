import { expect, test } from '@playwright/test';
import { login, openMainMenu, uniqueRef } from './support/dolibarr';
import path from 'path';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-028 – Documentos vinculados', () => {
  test('adjunta un documento y categoriza correctamente', async ({ page }, workerInfo) => {
    await login(page);
    await openMainMenu(page, /Products|Productos/i);

    const reference = uniqueRef('QA-DOC');
    await page.getByRole('link', { name: /New product|Nuevo producto/i }).click();
    await page.getByLabel(/Label|Etiqueta/i).fill('QA Producto Documentos');
    await page.getByLabel(/Reference|Referencia/i).fill(reference);
    await page.getByRole('button', { name: /Create|Save|Guardar/i }).click();

    await page.getByRole('link', { name: /Documents|Documentos/i }).click();
    const fileInput = page.locator('input[type="file"]').first();
    const evidenceFile = path.resolve(workerInfo.project.testDir, '../fixtures/sample.pdf');
    await fileInput.setInputFiles(evidenceFile);
    await page.locator('input[name="label"]').fill('Ficha técnica');
    await page.getByRole('button', { name: /Upload|Subir/i }).click();

    const row = page.locator('table.list tbody tr').first();
    await expect(row).toContainText('Ficha técnica');

    const categorySelect = page.locator('select[name="catid"]');
    if (await categorySelect.isVisible().catch(() => false)) {
      await categorySelect.selectOption({ index: 1 });
      await page.getByRole('button', { name: /Classify|Clasificar/i }).click();
      await expect(row).toContainText(/Category|Categoría/i);
    }
  });
});
