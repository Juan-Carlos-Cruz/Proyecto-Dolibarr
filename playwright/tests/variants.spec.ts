import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

const attributes = [
  { name: 'Talla', values: ['S', 'M', 'L'] },
  { name: 'Color', values: ['Rojo', 'Azul'] }
];

test.describe('HU-008 variantes', () => {
  test('PF-008: crear y listar variantes talla/color', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Configuración|Setup/i }).click();
    await page.getByRole('link', { name: /Atributos/i }).click();

    for (const attribute of attributes) {
      await page.getByRole('button', { name: /Nuevo atributo/i }).click();
      await page.getByLabel(/Nombre/i).fill(attribute.name);
      await page.getByRole('button', { name: /Guardar/i }).click();
      for (const value of attribute.values) {
        await page.getByRole('button', { name: /Nuevo valor/i }).click();
        await page.getByLabel(/Valor/i).fill(value);
        await page.getByRole('button', { name: /Guardar/i }).click();
      }
    }

    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: /Producto QA 1|PROD-/i }).first().click();
    await page.getByRole('link', { name: /Variantes/i }).click();
    await page.getByRole('button', { name: /Generar variantes/i }).click();
    await page.getByRole('button', { name: /Seleccionar todo/i }).click();
    await page.getByRole('button', { name: /Crear variantes/i }).click();
    await expect(page.getByRole('table')).toContainText('Talla');
    await expect(page.getByRole('table')).toContainText('Color');
  });
});
