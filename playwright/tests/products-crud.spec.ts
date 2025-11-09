import test from 'node:test';
import assert from 'node:assert/strict';
import { productSeeds } from '../fixtures/test-data';
import { loginAsAdmin } from '../helpers/auth';

test('HU-002 Productos físicos CRUD', async (t) => {
  await t.test('PF-002: crear y desactivar múltiples productos', () => {
    const app = loginAsAdmin();
    const baseSeeds = productSeeds.slice(0, 10);

    baseSeeds.forEach((seed, index) => {
      const reference = `${seed.reference}-T${index + 1}`;
      const created = app.createProduct({
        ...seed,
        reference,
        label: `${seed.label} clon`,
      });
      assert.equal(created.reference, reference);
      assert.equal(created.status, 'ACTIVE');

      app.disableProduct(reference);
      const stored = app.getProduct(reference);
      assert.equal(stored.status, 'DISABLED');
    });
  });

  await t.test('PF-002: validaciones de etiqueta vacía', () => {
    const app = loginAsAdmin();
    assert.throws(
      () =>
        app.createProduct({
          ...productSeeds[0],
          reference: 'PROD-TEST-0001',
          label: '',
        }),
      /Label is required/
    );
  });
});
