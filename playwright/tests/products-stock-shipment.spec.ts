import test from 'node:test';
import assert from 'node:assert/strict';
import { loginAsAdmin } from '../helpers/auth';

test('HU-003 Stock vs Shipment visibility', async (t) => {
  await t.test('PF-003: verificar visibilidad de productos y servicios', () => {
    const app = loginAsAdmin();
    const visibility = app.getStockVisibility();
    assert.ok(visibility.included.some((label) => label.includes('Producto QA')));
    assert.ok(visibility.excluded.some((label) => label.includes('Servicio QA')));
  });

  await t.test('PF-003: crear envío solo para productos físicos', () => {
    const app = loginAsAdmin();
    app.registerMovement({
      warehouse: 'Central',
      reference: 'PROD-0000001',
      quantity: 5,
      reason: 'Preparación',
      type: 'in',
    });
    const shipment = app.createShipment('PROD-0000001', 2);
    assert.equal(shipment.status, 'SHIPPED');
    assert.throws(() => app.createShipment('PROD-0000005', 1), /Only physical products can be shipped/);
  });
});
