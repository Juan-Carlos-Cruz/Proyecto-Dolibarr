import test from 'node:test';
import assert from 'node:assert/strict';
import { loginAsAdmin } from '../helpers/auth';

const vatValues = [0, 0.05, 0.19, 0.25];

const priceMatrix = [
  { base: 100, min: 80 },
  { base: 50, min: 55 },
];

test('HU-021/022 políticas de precios', async (t) => {
  await t.test('PF-006: modificar precio base y VAT', () => {
    const app = loginAsAdmin();
    for (const vat of vatValues) {
      const result = app.updatePricing('PROD-0000001', {
        basePrice: 100,
        minPrice: 90,
        vatRate: vat,
      });
      if (vat > 0.21) {
        assert.equal(result.status, 'warning');
        assert.match(result.message, /VAT out of range/);
      } else {
        assert.equal(result.status, 'saved');
      }
    }
    const history = app.getPricingHistory('PROD-0000001');
    assert.equal(history.length, vatValues.length);
  });

  await t.test('PF-005: consulta historial y precios base/min', () => {
    const app = loginAsAdmin();
    for (const scenario of priceMatrix) {
      const result = app.updatePricing('PROD-0000002', {
        basePrice: scenario.base,
        minPrice: scenario.min,
        vatRate: 0.19,
      });
      if (scenario.base < scenario.min) {
        assert.equal(result.status, 'error');
        assert.match(result.message, /Minimum price/);
      } else {
        assert.equal(result.status, 'saved');
      }
    }
    const history = app.getPricingHistory('PROD-0000002');
    assert.equal(history.length, priceMatrix.length);
    assert.ok(history.every((entry) => entry.user === 'admin'));
  });
});
