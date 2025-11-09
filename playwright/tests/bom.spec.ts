import test from 'node:test';
import assert from 'node:assert/strict';
import { bomSeeds } from '../fixtures/test-data';
import { loginAsAdmin } from '../helpers/auth';

test('HU-010 al HU-014 BOM', async (t) => {
  for (const bom of bomSeeds) {
    await t.test(`PF-012: crear y validar BOM ${bom.reference}`, () => {
      const app = loginAsAdmin();
      const created = app.createBom(bom.reference, bom.label);
      assert.equal(created.status, 'DRAFT');
      for (const line of bom.lines) {
        const updated = app.addBomLine(bom.reference, line);
        assert.ok(updated.lines.some((row) => row.reference === line.reference));
      }
      const validated = app.validateBom(bom.reference);
      assert.equal(validated.status, 'VALIDATED');
      const reportName = app.generateBomReportName(bom.reference);
      assert.ok(reportName.endsWith('.odt'));
    });
  }
});
