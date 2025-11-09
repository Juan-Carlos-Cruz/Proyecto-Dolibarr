import test from 'node:test';
import assert from 'node:assert/strict';
import { loginAsAdmin } from '../helpers/auth';

const attributes = [
  { name: 'Talla', values: ['S', 'M', 'L'] },
  { name: 'Color', values: ['Rojo', 'Azul'] },
];

test('HU-008 variantes', async (t) => {
  await t.test('PF-008: crear y listar variantes talla/color', () => {
    const app = loginAsAdmin();
    for (const attribute of attributes) {
      app.registerAttribute(attribute.name, attribute.values);
    }
    const combinations = app.generateVariants('PROD-0000001');
    assert.equal(combinations, attributes[0].values.length * attributes[1].values.length);
    const variants = app.listVariants('PROD-0000001');
    assert.equal(variants.length, combinations);
    assert.ok(variants.includes('S|Rojo'));
    assert.ok(variants.includes('M|Azul'));
  });
});
