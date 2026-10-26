import {
  test,
  expect,
  type Locator,
  type Page,
  type Request,
} from '@playwright/test';
import {
  isLmsRequest,
  stubLmsGateway,
  type GatewayStub,
} from './support/lms-gateway';
import { LMS_FIXTURES } from './support/lms-fixtures';

/**
 * Examinations, examination papers, grading systems and grading scales in
 * umdzidzisi-admin, against a stubbed learning-management gateway.
 */

const BASE: string = '/umdzidzisi-admin/examinations';

function row(page: Page, text: string): Locator {
  return page.getByRole('row').filter({ hasText: text });
}

test.describe('umdzidzisi-admin examinations', () => {
  let gateway: GatewayStub;

  test.beforeEach(async ({ page }) => {
    gateway = await stubLmsGateway(page, { lms: LMS_FIXTURES });
  });

  test('examinations resolve their board and level, and load with X-Limit', async ({
    page,
  }) => {
    const listRequest: Promise<Request> = page.waitForRequest(
      (request: Request): boolean =>
        isLmsRequest('examinations')(request) &&
        request.headers()['x-limit'] !== undefined,
    );

    await page.goto(`${BASE}/all`);

    expect((await listRequest).headers()['x-limit']).toBe('100');
    await expect(
      page.getByRole('heading', { name: 'Examinations' }),
    ).toBeVisible();
    const november: Locator = row(page, 'November O Level Examinations');
    await expect(november).toContainText('ZIMSEC');
    await expect(november).toContainText('Ordinary Level');
    const june: Locator = row(page, 'June A Level Series');
    await expect(june).toContainText('Cambridge');
    await expect(june).toContainText('Advanced Level');

    await page.getByRole('button', { name: 'New Examination' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Create Examination' }),
    ).toBeVisible();
  });

  test('all?examinationBoardId= shows only that board’s examinations', async ({
    page,
  }) => {
    await page.goto(`${BASE}/all?examinationBoardId=board-cambridge`);

    await expect(row(page, 'June A Level Series')).toBeVisible();
    await expect(row(page, 'November O Level Examinations')).toHaveCount(0);
  });

  test('all/:id opens the examination drawer', async ({ page }) => {
    await page.goto(`${BASE}/all/exam-zimsec-olevel`);

    await expect(
      page.getByRole('dialog', { name: 'November O Level Examinations' }),
    ).toBeVisible();
  });

  test('examination papers resolve their subject and level', async ({
    page,
  }) => {
    await page.goto(`${BASE}/papers`);

    await expect(
      page.getByRole('heading', { name: 'Examination Papers' }),
    ).toBeVisible();
    const maths: Locator = row(page, 'Mathematics Paper 1');
    await expect(maths).toContainText('Mathematics');
    await expect(maths).toContainText('Ordinary Level');
    const physics: Locator = row(page, 'Physics Paper 1');
    await expect(physics).toContainText('Advanced Level');

    await page.getByRole('button', { name: 'New examination paper' }).click();
    await expect(
      page.getByRole('dialog', { name: 'New Examination Paper' }),
    ).toBeVisible();
  });

  test('papers?subjectId= shows only that subject’s papers', async ({
    page,
  }) => {
    await page.goto(`${BASE}/papers?subjectId=subject-physics`);

    await expect(row(page, 'Physics Paper 1')).toBeVisible();
    await expect(row(page, 'Mathematics Paper 1')).toHaveCount(0);
  });

  test('papers/:id opens the paper drawer', async ({ page }) => {
    await page.goto(`${BASE}/papers/paper-maths-1`);

    await expect(
      page.getByRole('dialog', { name: 'Mathematics Paper 1' }),
    ).toBeVisible();
  });

  test('grading systems resolve their examination', async ({ page }) => {
    await page.goto(`${BASE}/grading-systems`);

    await expect(
      page.getByRole('heading', { name: 'Grading Systems' }),
    ).toBeVisible();
    await expect(row(page, 'O Level Letter Grades')).toContainText(
      'November O Level Examinations',
    );
    await expect(row(page, 'A Level Points')).toContainText(
      'June A Level Series',
    );

    await page.getByRole('button', { name: 'New Grading System' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Create Grading System' }),
    ).toBeVisible();
  });

  test('grading-systems/:id opens the grading system drawer', async ({
    page,
  }) => {
    await page.goto(`${BASE}/grading-systems/grading-system-alevel`);

    await expect(
      page.getByRole('dialog', { name: 'A Level Points' }),
    ).toBeVisible();
  });

  test('grading scales resolve their grading system', async ({ page }) => {
    await page.goto(`${BASE}/grading-scales`);

    await expect(
      page.getByRole('heading', { name: 'Grading Scales' }),
    ).toBeVisible();
    await expect(row(page, '70–100')).toContainText('O Level Letter Grades');
    await expect(row(page, '60–69')).toContainText('O Level Letter Grades');

    await page.getByRole('button', { name: 'New Grading Scale' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Create Grading Scale' }),
    ).toBeVisible();
  });

  test('grading-scales/:id opens the grading scale drawer', async ({
    page,
  }) => {
    await page.goto(`${BASE}/grading-scales/scale-b`);

    await expect(page.getByRole('dialog', { name: 'Grade B' })).toBeVisible();
  });

  test('an overlapping grading scale is blocked before it is submitted', async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/grading-scales?gradingSystemId=grading-system-olevel`,
    );
    await page.getByRole('button', { name: 'New Grading Scale' }).click();

    const dialog: Locator = page.getByRole('dialog', {
      name: 'Create Grading Scale',
    });
    await expect(dialog.getByLabel('Grading System')).toHaveValue(
      'grading-system-olevel',
    );
    await dialog.getByLabel('Symbol').fill('C');
    await dialog.getByLabel('Minimum score').fill('62');
    await dialog.getByLabel('Maximum score').fill('65');

    await expect(dialog.getByRole('alert')).toHaveText(
      '62–65 overlaps “B” (60–69).',
    );
    await expect(
      dialog.getByRole('button', { name: 'Create Scale' }),
    ).toBeDisabled();

    // A non-overlapping range clears the error and enables submit.
    await dialog.getByLabel('Minimum score').fill('50');
    await dialog.getByLabel('Maximum score').fill('59');
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(
      dialog.getByRole('button', { name: 'Create Scale' }),
    ).toBeEnabled();

    expect(
      gateway.requests.filter(isLmsRequest('grading-scales', 'POST')),
    ).toHaveLength(0);
  });
});
