import { test, expect } from '@playwright/test';
import fs from 'fs';

test('login y guarda sesión', async ({ page }) => {
  fs.mkdirSync('auth', { recursive: true });

  // Usa el baseURL del config; ve a la raíz
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // ¿Ya está logeado? (enlace de home + no hay campo password)
  const hasHomeLink = await page.locator('a[href*="mainmenu=home"]').first().isVisible().catch(() => false);
  const passwordFields = await page.locator('input[type="password"]').count();
  if (hasHomeLink && passwordFields === 0) {
    await page.context().storageState({ path: 'auth/state.json' });
    return;
  }

  // No está logeado: espera campos accesibles y haz login
  const user = process.env.DOLI_USER || 'admin';
  const pass = process.env.DOLI_PASS || 'admin';

  await expect(page.getByRole('textbox', { name: /Login/i })).toBeVisible({ timeout: 200 });
  await expect(page.getByRole('textbox', { name: /Password/i })).toBeVisible();

  await page.getByRole('textbox', { name: /Login/i }).fill(user);
  await page.getByRole('textbox', { name: /Password/i }).fill(pass);
  await page.getByRole('button', { name: /Login|Entrar/i }).click();

  // Validación post-login: estás en index.php y ya no hay campo password
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/index\.php/i);
  await expect(page.getByRole('textbox', { name: /Password/i })).toHaveCount(0);

  await page.context().storageState({ path: 'auth/state.json' });
});
