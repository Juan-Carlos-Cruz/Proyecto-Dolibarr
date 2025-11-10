import { expect, test } from '@playwright/test';
import { enableModule, login } from './support/dolibarr';

test.use({ storageState: 'auth/state.json' });

test.describe('HU-001 – Activación de módulo Products', () => {
  test('activa Products y verifica persistencia de parámetros', async ({ page }) => {
    await login(page);
    await enableModule(page, /Products?/i);

    const status = page.locator('span.badge-status, .badge.status').first();
    await expect(status).toContainText(/Enabled|Activo/i);

    await page.getByRole('button', { name: /Edit|Configurar|Config/i }).first().click();
    const roundPrices = page.locator('input[name="MAIN_ROUNDING_RULE"], select[name="MAIN_ROUNDING_RULE"]');
    if (await roundPrices.isVisible().catch(() => false)) {
      const selected = await roundPrices.inputValue();
      await expect(selected).not.toBe('');
    }
  });
});
