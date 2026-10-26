import {
  test,
  expect,
  type Locator,
  type Page,
  type Request,
} from '@playwright/test';
import { isLmsRequest, stubLmsGateway } from './support/lms-gateway';
import { LMS_FIXTURES } from './support/lms-fixtures';

/**
 * Assessments in umdzidzisi-admin, against a stubbed learning-management
 * gateway. Unlike the header-paginated LMS lists, assessments page with
 * `limit` / `offset` query params.
 */

const BASE: string = '/umdzidzisi-admin/examinations/assessments';

function row(page: Page, text: string): Locator {
  return page.getByRole('row').filter({ hasText: text });
}

test.describe('umdzidzisi-admin assessments', () => {
  test.beforeEach(async ({ page }) => {
    await stubLmsGateway(page, { lms: LMS_FIXTURES });
  });

  test('assessments resolve their paper and subject, paging by limit/offset', async ({
    page,
  }) => {
    const listRequest: Promise<Request> = page.waitForRequest(
      isLmsRequest('assessments'),
    );

    await page.goto(BASE);

    const params: URLSearchParams = new URL((await listRequest).url())
      .searchParams;
    expect(params.get('limit')).toBe('100');
    expect(params.get('offset')).toBe('0');

    await expect(
      page.getByRole('heading', { name: 'Assessments' }),
    ).toBeVisible();
    const algebra: Locator = row(page, 'Algebra Revision Quiz');
    await expect(algebra).toContainText('Mathematics Paper 1');
    await expect(algebra).toContainText('Mathematics');
    await expect(algebra).toContainText('Ordinary Level');
    const kinematics: Locator = row(page, 'Kinematics Check');
    await expect(kinematics).toContainText('Physics Paper 1');
    await expect(kinematics).toContainText('Physics');
  });

  test('assessments?examinationPaperId= shows only that paper’s assessments', async ({
    page,
  }) => {
    await page.goto(`${BASE}?examinationPaperId=paper-physics-1`);

    await expect(row(page, 'Kinematics Check')).toBeVisible();
    await expect(row(page, 'Algebra Revision Quiz')).toHaveCount(0);
  });

  test('assessments/:id opens the assessment drawer', async ({ page }) => {
    await page.goto(`${BASE}/assessment-algebra`);

    await expect(
      page.getByRole('dialog', { name: 'Algebra Revision Quiz' }),
    ).toBeVisible();
  });

  test('creating an assessment POSTs the form, toasts and opens its drawer', async ({
    page,
  }) => {
    await page.goto(BASE);
    await page.getByRole('button', { name: 'New assessment' }).click();

    const dialog: Locator = page.getByRole('dialog', {
      name: 'New Assessment',
    });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Examination paper').selectOption('paper-maths-1');
    // The level is prefilled from the paper's subject.
    await expect(dialog.getByLabel('Educational level')).toHaveValue(
      'Ordinary Level',
    );
    await dialog.getByLabel('Title').fill('Quadratics Quiz');

    const postPromise: Promise<Request> = page.waitForRequest(
      isLmsRequest('assessments', 'POST'),
    );
    await dialog.getByRole('button', { name: 'Create Assessment' }).click();
    const post: Request = await postPromise;

    expect(post.postDataJSON()).toEqual({
      examinationPaperId: 'paper-maths-1',
      educationalLevel: 'Ordinary Level',
      title: 'Quadratics Quiz',
      description: '',
      topicTags: [],
      status: 'DRAFT',
      questions: [],
    });
    await expect(
      page.getByText('Assessment created. Add its questions next.'),
    ).toBeVisible();
    await expect(
      page.getByRole('dialog', { name: 'Quadratics Quiz' }),
    ).toBeVisible();
  });

  test('the create dialog’s Title label is associated with its input', async ({
    page,
  }) => {
    await page.goto(BASE);
    await page.getByRole('button', { name: 'New assessment' }).click();

    const dialog: Locator = page.getByRole('dialog', {
      name: 'New Assessment',
    });
    await expect(dialog.getByRole('textbox', { name: 'Title' })).toBeVisible();
  });
});
