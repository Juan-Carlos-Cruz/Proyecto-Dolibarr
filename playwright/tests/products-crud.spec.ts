import { expect, test } from '@playwright/test';
import { ensureModuleEnabled, loginAsAdmin } from '../helpers/auth';

const createUniqueRef = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

test.describe.serial('HU-002 CRUD de productos físicos', () => {
  let productRef: string;
  const productLabel = 'Producto QA físico';

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    await ensureModuleEnabled(page, 'modProduct');
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('PF-002: crear producto físico con peso/tamaño/HTS', async ({ page }) => {
    productRef = createUniqueRef('PROD');

    await page.goto('/product/card.php?action=create&type=0');

    await test.step('Rellenar ficha básica', async () => {
      await page.locator('input[name="ref"]').fill(productRef);
      await page.locator('input[name="label"]').fill(`${productLabel} ${productRef}`);

      const weightField = page.locator('input[name="weight"], input[name="weight_kg"]').first();
      if (await weightField.isVisible()) {
        await weightField.fill('0.10');
      }

      for (const selector of ['input[name="length"]', 'input[name="size_l"]']) {
        const field = page.locator(selector).first();
        if (await field.isVisible()) {
          await field.fill('10');
          break;
        }
      }

      for (const selector of ['input[name="width"]', 'input[name="size_w"]']) {
        const field = page.locator(selector).first();
        if (await field.isVisible()) {
          await field.fill('10');
          break;
        }
      }

      for (const selector of ['input[name="height"]', 'input[name="size_h"]']) {
        const field = page.locator(selector).first();
        if (await field.isVisible()) {
          await field.fill('5');
          break;
        }
      }

      const htsField = page.locator('input[name="customcode"], input[name="intracode"]');
      if (await htsField.first().isVisible()) {
        await htsField.first().fill('1234.56.78');
      }
    });

    await Promise.any([
      page.getByRole('button', { name: /Create|Save|Guardar/i }).click(),
      page.locator('input[type="submit"][name="save"]').click(),
    ]);

    await expect(page.locator('div.ok, div.msg-ok').first()).toBeVisible();
    await expect(page.locator('h1, h2').filter({ hasText: productRef })).toBeVisible();
  });

  test('PF-002: editar y validar datos límite', async ({ page }) => {
    test.skip(!productRef, 'El producto base no fue creado');
    await page.goto(`/product/card.php?ref=${productRef}&action=edit`);

    const weightField = page.locator('input[name="weight"], input[name="weight_kg"]').first();
    if (await weightField.isVisible()) {
      await weightField.fill('9999');
    }

    for (const selector of ['input[name="length"]', 'input[name="size_l"]']) {
      const field = page.locator(selector).first();
      if (await field.isVisible()) {
        await field.fill('9999');
        break;
      }
    }

    for (const selector of ['input[name="width"]', 'input[name="size_w"]']) {
      const field = page.locator(selector).first();
      if (await field.isVisible()) {
        await field.fill('1');
        break;
      }
    }

    for (const selector of ['input[name="height"]', 'input[name="size_h"]']) {
      const field = page.locator(selector).first();
      if (await field.isVisible()) {
        await field.fill('1');
        break;
      }
    }

    const htsField = page.locator('input[name="customcode"], input[name="intracode"]');
    if (await htsField.first().isVisible()) {
      await htsField.first().fill('9999.99.99');
    }

    await Promise.any([
      page.getByRole('button', { name: /Save|Guardar/i }).click(),
      page.locator('input[type="submit"][name="save"]').click(),
    ]);

    await expect(page.locator('div.ok, div.msg-ok').first()).toContainText(/saved|modificado/i);
    await expect(page.locator('div.tabBar').first()).toBeVisible();
  });

  test('PF-002: desactivar producto y validar exclusión en nuevos documentos', async ({ page }) => {
    test.skip(!productRef, 'El producto base no fue creado');

    await page.goto(`/product/card.php?ref=${productRef}`);

    const deactivateLink = page
      .locator(`a[href*="action=statut"][href*="value=0"], form[action*="statut"] input[value="0"]`)
      .first();

    if (await deactivateLink.isVisible()) {
      await Promise.any([
        deactivateLink.click(),
        page.locator('form[action*="statut"] input[type="submit"][value="0"]').click(),
      ]).catch(() => deactivateLink.click());
    }

    await expect(
      page.locator('div.statusref, span.badge').filter({ hasText: /Inactive|Disabled|Desactivado/i })
    ).toBeVisible();

    await page.goto('/comm/card.php?action=create&leftmenu=comm');
    await expect(page.locator(`select[name*="product"] option[value="${productRef}"]`)).toHaveCount(0);
  });
});
