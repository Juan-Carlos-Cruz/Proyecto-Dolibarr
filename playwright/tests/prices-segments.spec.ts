import test from 'node:test';
import assert from 'node:assert/strict';
import { segmentMatrix } from '../fixtures/test-data';
import { loginAsAdmin } from '../helpers/auth';

test('HU-006 multiprecios por segmento', async (t) => {
  await t.test('PF-007: validar precios por segmento en pedidos', () => {
    const app = loginAsAdmin();
    const productRef = 'PROD-0000001';

    segmentMatrix.forEach((segment) => {
      app.setSegmentPrice(productRef, segment, 120 + segment * 5);
    });

    const customer = 'Cliente segmento 1';
    app.createThirdParty(customer, 1);
    const order = app.createSalesOrder(customer);
    const withLine = app.addOrderLine(order.id, productRef, 2);
    const line = withLine.lines[withLine.lines.length - 1];
    assert.ok(line);
    assert.equal(line?.segment, 1);
    assert.equal(line?.price, (120 + 1 * 5) * 2);
  });
});
