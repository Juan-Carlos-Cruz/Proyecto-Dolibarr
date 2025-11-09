import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';

const attributes = [
  { name: 'Talla', values: ['S', 'M', 'L'] },
  { name: 'Color', values: ['Rojo', 'Azul'] }
];

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;
const VARIANTS_MODULE_PATTERN = /(Attributes?\s*&\s*variants?)|(Atributos?\s*y\s*variantes?)/i;

test.describe('HU-008 variantes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await ensureModuleActivated(page, VARIANTS_MODULE_PATTERN);
    await page.goto('/');
  });

  test('PF-008: crear y listar variantes talla/color', async ({ page }) => {
    await page.getByRole('link', { name: /Configuración|Setup/i }).click();
    await page.getByRole('link', { name: /Atributos|Attributes/i }).click();

    for (const attribute of attributes) {
      await page.getByRole('button', { name: /Nuevo atributo|New attribute/i }).click();
      await page.getByLabel(/Nombre|Name/i).fill(attribute.name);
      await page.getByRole('button', { name: /Guardar|Save/i }).click();
      for (const value of attribute.values) {
        await page.getByRole('button', { name: /Nuevo valor|New value/i }).click();
        await page.getByLabel(/Valor|Value/i).fill(value);
        await page.getByRole('button', { name: /Guardar|Save/i }).click();
      }
    }

    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: /Producto QA 1|PROD-/i }).first().click();
    await page.getByRole('link', { name: /Variantes|Variants/i }).click();
    await page.getByRole('button', { name: /Generar variantes|Generate variants/i }).click();
    await page.getByRole('button', { name: /Seleccionar todo|Select all/i }).click();
    await page.getByRole('button', { name: /Crear variantes|Create variants/i }).click();
    await expect(page.getByRole('table')).toContainText('Talla');
    await expect(page.getByRole('table')).toContainText('Color');
  });
});
