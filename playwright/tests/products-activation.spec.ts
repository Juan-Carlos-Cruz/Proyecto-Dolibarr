import { test, expect } from '@playwright/test';
import { loginAsAdmin, ensureModuleActivated } from '../helpers/auth';

test.describe('HU-001 Products activation', () => {
  test('PF-001: activar módulo Products y persistir configuración', async ({ page }) => {
    await loginAsAdmin(page);
    await ensureModuleActivated(page, 'Products');
    await expect(page.getByRole('heading', { name: /Products/i })).toBeVisible();
  });
});
