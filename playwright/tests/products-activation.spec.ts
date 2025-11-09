import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureModuleActivated, loginAsAdmin } from '../helpers/auth';

const MODULES = {
  products: 'Products/Services' as const,
  bom: 'Bill of Materials' as const,
  stock: 'Stock' as const,
  variants: 'Attributes & Variants' as const,
};

test('HU-001 Activación de módulos Dolibarr v22', async (t) => {
  await t.test('PF-001: activar módulo Products/Services y abrir listado', () => {
    const app = loginAsAdmin();
    ensureModuleActivated(app, MODULES.products);
    assert.ok(app.isModuleActive(MODULES.products));
    const listing = app.listProducts({ labelContains: 'Producto QA' });
    assert.ok(listing.length > 0, 'Se esperaba listado de productos semilla');
  });

  await t.test('PF-012: activar módulo Bill of Materials y acceder a menú', () => {
    const app = loginAsAdmin();
    ensureModuleActivated(app, MODULES.bom);
    app.seedBomFixtures();
    const bom = app.createBom('BOM-QA-999', 'Kit QA temporal');
    assert.equal(bom.status, 'DRAFT');
    assert.ok(app.isModuleActive(MODULES.bom));
  });

  await t.test('PF-003: activar módulo Stock y validar tablero', () => {
    const app = loginAsAdmin();
    ensureModuleActivated(app, MODULES.stock);
    const movement = app.registerMovement({
      warehouse: 'Central',
      reference: 'PROD-0000001',
      quantity: 5,
      reason: 'Inicial',
      type: 'in',
    });
    assert.equal(movement.warehouse, 'Central');
    assert.ok(app.isModuleActive(MODULES.stock));
  });

  await t.test('PF-008: activar módulo Attributes & Variants y ver catálogo', () => {
    const app = loginAsAdmin();
    ensureModuleActivated(app, MODULES.variants);
    app.registerAttribute('Talla', ['S', 'M']);
    app.registerAttribute('Color', ['Rojo']);
    const variants = app.generateVariants('PROD-0000001');
    assert.equal(variants, 2, 'Se esperaban combinaciones S/M con color Rojo');
  });
});
