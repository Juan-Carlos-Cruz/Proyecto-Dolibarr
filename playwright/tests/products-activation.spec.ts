import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';

const PRODUCTS_MODULE_PATTERN = /(Products?\s*\/\s*Services?)|(Productos?\s*\/\s*Servicios?)/i;
const BOM_MODULE_PATTERN = /(Bill of materials)|(Listas de materiales)/i;
const STOCK_MODULE_PATTERN = /(Stock management)|(Gestión de stocks)|(Almac[eé]n)/i;
const VARIANTS_MODULE_PATTERN = /(Attributes?\s*&\s*variants?)|(Atributos?\s*y\s*variantes?)/i;

test.describe('HU-001 Activación de módulos Dolibarr v22', () => {
  test('PF-001: activar módulo Products/Services y abrir listado', async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, PRODUCTS_MODULE_PATTERN);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await expect(page.getByRole('heading', { name: /Productos|Products/i })).toBeVisible();
  });

  test('PF-012: activar módulo Bill of Materials y acceder a menú', async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, BOM_MODULE_PATTERN);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await expect(page.getByRole('link', { name: /Listas de materiales|BOM/i })).toBeVisible();
  });

  test('PF-003: activar módulo Stock y validar tablero', async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, STOCK_MODULE_PATTERN);
    await page.getByRole('link', { name: /Almac[eé]n|Stock/i }).click();
    await expect(page.getByRole('heading', { name: /Almac[eé]n|Stock/i })).toBeVisible();
  });

  test('PF-008: activar módulo Attributes & Variants y ver catálogo', async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, VARIANTS_MODULE_PATTERN);
    await page.getByRole('link', { name: /Configuración|Setup/i }).click();
    await expect(page.getByRole('link', { name: /Atributos|Attributes/i })).toBeVisible();
  });
});
