import { test, expect } from '@playwright/test';
import { loginIfNeeded, selectOption } from './support/dolibarr';

/**
 * ======================================================
 *   Taguchi L12 (2^11) – Third-parties > Create
 *   Dolibarr 19.x – Select2 y validaciones “vanilla”
 *   >>> Versión SIN VAT <<<
 * ======================================================
 *
 * Cambios:
 * - Eliminado todo manejo/validación de VAT (checkbox y VAT ID).
 * - C8 de la matriz L12 queda reservada/no usada.
 */

// =====================
// BANDERAS DE ORÁCULO
// =====================
const EXPECT_DUPLICATE_TO_FAIL = false;
const EXPECT_EMAIL_INVALID_TO_FAIL = false;
const EXPECT_NAME_LONG_TO_FAIL = false;

// =====================
// Taguchi L12 (2^11)
// =====================
type Lvl = 1|2;
type Run = [Lvl,Lvl,Lvl,Lvl,Lvl,Lvl,Lvl,Lvl,Lvl,Lvl,Lvl]; // C1..C11

// Columnas (todas binarias):
// C1  EntityType      1=Company   2=Individual
// C2  Customer        1=No        2=Yes
// C3  Supplier        1=No        2=Yes
// C4  Prospect        1=No        2=Yes
// C5  Status          1=Closed    2=Open
// C6  EmailCase       1=Valid     2=Invalid
// C7  PhoneType       1=local     2=intl
// C8  (RESERVADA / NO USADA)   1,2 (se ignora)
// C9  DuplicateName   1=Unique    2=Duplicate
// C10 CountryGroup    1=EU        2=NonEU
// C11 NameLength      1=Short     2=Long(>128)
const L12: Run[] = [
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,2,2,2,2,2,2],
  [1,1,2,2,2,1,1,2,2,2,2],
  [1,2,1,2,2,1,2,1,2,2,2],
  [1,2,2,1,2,2,1,1,2,2,2],
  [1,2,2,2,1,2,2,1,1,1,1],
  [2,1,1,2,2,2,2,1,1,2,2],
  [2,1,2,1,2,1,2,2,1,1,2],
  [2,2,1,1,2,2,1,2,1,2,1],
  [2,2,1,2,1,2,1,2,2,1,2],
  [2,2,2,1,1,1,2,2,2,1,1],
  [2,1,2,2,1,1,1,1,2,2,1],
];

function lvl<T>(l: Lvl, v1: T, v2: T): T { return l===1 ? v1 : v2; }

function phoneOf(kind: 'local'|'intl') {
  return kind === 'intl' ? '+1 202 555 0101' : '555123456';
}

// Mapeos de DOM reales
const countryEUValue    = '4';   // Spain (EU)
const countryNonEUValue = '11';  // United States (NonEU)
// typent_id: 3=Company/SME, 8=Individual
const typentValue: Record<'Company'|'Individual', string> = { Company: '3', Individual: '8' };

// =====================
// Modelado del “row”
// =====================
type Row = ReturnType<typeof mapRunToRow>;

function mapRunToRow(run: Run, i: number) {
  const [c1,c2,c3,c4,c5,c6,c7,_c8,c9,c10,c11] = run; // _c8: reservada/no usada
  const entityType   = lvl(c1,'Company','Individual');
  const customer     = lvl(c2,'No','Yes');
  const supplier     = lvl(c3,'No','Yes');
  const prospect     = lvl(c4,'No','Yes');
  const status       = lvl(c5,'Closed','Open');
  const emailInvalid = lvl(c6,false,true);
  const phoneType    = lvl(c7,'local','intl') as 'local'|'intl';
  const duplicate    = lvl(c9,false,true);
  const countryGroup = lvl(c10,'EU','NonEU') as 'EU'|'NonEU';
  const nameLong     = lvl(c11,false,true);

  const countryValue = countryGroup === 'EU' ? countryEUValue : countryNonEUValue;
  const email = emailInvalid ? 'foo@@bar' : `qa.tg.${i}@example.com`;
  const nameBase = nameLong ? 'X'.repeat(140) : `QA-TG-${Date.now()}-${i}`;

  return {
    EntityType: entityType,
    Customer: customer,
    Supplier: supplier,
    Prospect: prospect,
    Status: status,
    EmailInvalid: emailInvalid,
    PhoneType: phoneType,
    Duplicate: duplicate,
    CountryGroup: countryGroup,
    NameLong: nameLong,
    CountryValue: countryValue,
    Email: email,
    Name: nameBase
  };
}

// =====================
// Oráculo (sin VAT)
// =====================
function expectedFail(row: Row): boolean {
  const ruleDup  = EXPECT_DUPLICATE_TO_FAIL && row.Duplicate;
  const ruleMail = EXPECT_EMAIL_INVALID_TO_FAIL && row.EmailInvalid;
  const ruleLen  = EXPECT_NAME_LONG_TO_FAIL   && row.NameLong;
  return ruleDup || ruleMail || ruleLen;
}

// =====================
// Seed para duplicados
// =====================
const DUP_SEED = 'TG-SEED-DUPLICATE-NAME';

async function createSeedIfMissing(page) {
  // Crea un tercero con nombre DUP_SEED (si tu instancia permite duplicados, no pasa nada por crearlo)
  await page.goto('/societe/list.php?type=0');
  const createLink = page.locator('a[href="/societe/card.php?action=create"]').first();
  if (await createLink.isVisible().catch(() => false)) {
    await createLink.click();
    await page.locator('#name, input[name="name"]').fill(DUP_SEED);
    // customerprospect: 0=neither, 1=Customer, 2=Prospect, 3=Prospect/Customer
    await selectOption(page, '#customerprospect', '0');
    // status: 0=Closed, 1=Open
    await selectOption(page, '#status', '1');
    await page.locator('#address').fill('Seed address');
    await page.locator('#zipcode').fill('28001');
    await page.locator('#town').fill('Madrid');
    await selectOption(page, '#selectcountry_id', countryEUValue);
    await selectOption(page, '#typent_id', typentValue['Company']);
    const saveBtn = page.locator('form button[type="submit"], form input[type="submit"]').first();
    await saveBtn.click();
    await page.waitForLoadState('networkidle');
  }
}

// =====================
// Tests L12 (sin VAT)
// =====================
test.describe('Third-parties > Create third party (Taguchi L12) – sin VAT', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginIfNeeded(page);
    await createSeedIfMissing(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page);
  });

  for (let i = 0; i < L12.length; i++) {
    const run = L12[i];

    test(`[${i+1}/12] L12 run`, async ({ page }) => {
      const row = mapRunToRow(run, i);

      // Ir a crear
      await page.goto('/societe/list.php?type=0');
      const createLink = page.locator('a[href="/societe/card.php?action=create"]').first();
      await expect(createLink).toBeVisible({ timeout: 10_000 });
      await createLink.click();

      // Nombre (o duplicado) – respeta maxlength=128 para evitar falsos positivos
      const nameInput = page.locator('#name, input[name="name"]').first();
      await expect(nameInput).toBeVisible({ timeout: 10_000 });
      const valueToFill = (row.Name).slice(0, 128);
      await nameInput.fill(row.Duplicate ? DUP_SEED : valueToFill);

      // Alias opcional
      const alias = page.locator('#name_alias_input, input[name="name_alias"]').first();
      if (await alias.isVisible().catch(() => false)) {
        await alias.fill(`Alias ${Date.now()}-${i}`);
      }

      // Entity type
      await selectOption(page, '#typent_id', typentValue[row.EntityType]);

      // Customer/Prospect
      const custProsVal =
        row.Customer==='Yes' && row.Prospect==='Yes' ? '3' :
        row.Customer==='Yes' && row.Prospect==='No'  ? '1' :
        row.Customer==='No'  && row.Prospect==='Yes' ? '2' : '0';
      await selectOption(page, '#customerprospect', custProsVal);

      // Status
      await selectOption(page, '#status', row.Status === 'Open' ? '1' : '0');

      // Dirección mínima
      await page.locator('#address, textarea[name="address"]').fill('Gran Vía 1');
      await page.locator('#zipcode, input[name="zipcode"]').fill('28001');
      await page.locator('#town, input[name="town"]').fill('Madrid');

      // Country (EU/NonEU)
      await selectOption(page, '#selectcountry_id', row.CountryValue);

      // Teléfono y Email
      await page.locator('#phone, input[name="phone"]').fill(phoneOf(row.PhoneType));
      const email = page.locator('#email, input[name="email"]').first();
      if (await email.isVisible().catch(() => false)) await email.fill(row.Email);

      // Guardar
      const saveBtn = page.locator('form button[type="submit"], form input[type="submit"]').first();
      await expect(saveBtn).toBeVisible({ timeout: 10_000 });
      await saveBtn.click();
      await page.waitForLoadState('networkidle');

      // Verificación: oráculo sin VAT
      const shouldFail = expectedFail(row);
      const stillOnForm = page.url().includes('card.php?action=create');

      if (shouldFail) {
        expect(stillOnForm, 'Se esperaba que el formulario NO se guardara (regla de negocio activada)').toBeTruthy();
        const errorBox = page.locator('.error, .errorbox, .ui-state-error, .errorwarning');
        if (await errorBox.first().isVisible().catch(() => false)) {
          console.log('❗Error UI:', await errorBox.first().innerText().catch(() => ''));
        }
      } else {
        expect(stillOnForm, 'El formulario no debería quedarse en modo creación').toBeFalsy();
        if (!row.Duplicate) {
          await expect(page.getByText(valueToFill, { exact: false })).toBeVisible({ timeout: 30_000 });
        }
      }

      // Telemetría útil para analizar huecos (sin VAT)
      test.info().annotations.push({
        type: 'observation',
        description: `Saved?=${!stillOnForm} | EmailInvalid=${row.EmailInvalid} | Country=${row.CountryGroup} | NameLong=${row.NameLong} | Duplicate=${row.Duplicate}`
      });
    });
  }
});
