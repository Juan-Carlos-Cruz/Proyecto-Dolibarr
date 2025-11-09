import test from 'node:test';
import assert from 'node:assert/strict';
import { loginAsAdmin } from '../helpers/auth';

const inventoryScenarios = [
  { movement: 'Entrada', type: 'in' as const, quantity: 10 },
  { movement: 'Salida', type: 'out' as const, quantity: 5 },
  { movement: 'Transferencia', type: 'transfer' as const, quantity: 3 },
];

test('HU-025 al HU-028 inventario y documentos', async (t) => {
  await t.test('PF-009: adjuntar documentos al producto', () => {
    const app = loginAsAdmin();
    const files = [
      { name: 'ficha-tecnica.pdf', category: 'Documentación', content: 'QA' },
      { name: 'foto.jpg', category: 'Imágenes', content: 'QA' },
    ];
    app.attachDocuments('PROD-0000001', files);
    const docs = app.getProductDocuments('PROD-0000001');
    assert.equal(docs.length, 2);
    assert.ok(docs.some((doc) => doc.name === 'ficha-tecnica.pdf'));
  });

  await t.test('PF-010: consulta de niveles por almacén', () => {
    const app = loginAsAdmin();
    app.registerMovement({
      warehouse: 'Central',
      reference: 'PROD-0000001',
      quantity: 4,
      reason: 'Inicial',
      type: 'in',
    });
    const snapshot = app.getWarehouseSnapshot('Central');
    assert.ok(snapshot.some((item) => item.reference === 'PROD-0000001' && item.quantity >= 4));
  });

  for (const scenario of inventoryScenarios) {
    await t.test(`PF-011: registrar movimiento ${scenario.movement}`, () => {
      const app = loginAsAdmin();
      app.registerMovement({
        warehouse: 'Central',
        reference: 'PROD-0000001',
        quantity: 10,
        reason: 'Inicial',
        type: 'in',
      });
      const movement = app.registerMovement({
        warehouse: 'Central',
        reference: 'PROD-0000001',
        quantity: scenario.quantity,
        reason: `QA ${scenario.movement}`,
        type: scenario.type,
      });
      assert.equal(movement.type, scenario.type);
      const log = app.getMovements();
      assert.ok(log.some((entry) => entry.reason.includes(`QA ${scenario.movement}`)));
    });
  }
});
