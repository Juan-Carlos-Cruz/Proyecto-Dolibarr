import test from 'node:test';
import assert from 'node:assert/strict';
import { segmentMatrix } from '../fixtures/test-data';
import { loginAsAdmin } from '../helpers/auth';

test('HU-017 listados de productos', async (t) => {
  await t.test('PF-004: filtrar vistas y ordenar referencias', () => {
    const app = loginAsAdmin();
    const ascending = app.listProducts({ labelContains: 'Producto QA', order: 'ASC' });
    const descending = app.listProducts({ labelContains: 'Producto QA', order: 'DESC' });
    assert.ok(ascending.length > 0);
    assert.equal(ascending[0].reference, [...ascending].sort((a, b) => a.reference.localeCompare(b.reference))[0].reference);
    assert.equal(descending[0].reference, [...descending].sort((a, b) => b.reference.localeCompare(a.reference))[0].reference);
  });

  await t.test('PF-007: multiprecios por segmento en documento de venta', () => {
    const app = loginAsAdmin();
    const reference = 'PROD-0000001';
    segmentMatrix.forEach((segment) => {
      app.setSegmentPrice(reference, segment, 100 + segment * 10);
    });

    segmentMatrix.forEach((segment) => {
      const customer = `Cliente segmento ${segment}`;
      app.createThirdParty(customer, segment);
      const order = app.createSalesOrder(customer);
      const withLine = app.addOrderLine(order.id, reference, 1);
      const lastLine = withLine.lines[withLine.lines.length - 1];
      assert.ok(lastLine);
      assert.equal(lastLine?.segment, segment);
      assert.equal(lastLine?.price, 100 + segment * 10);
    });
  });
});
