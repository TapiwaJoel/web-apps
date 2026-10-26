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
 * Curriculum pages in umdzidzisi-admin (boards → levels → grades → subjects →
 * topics → sub-topics) against a stubbed learning-management gateway.
 */

const BASE: string = '/umdzidzisi-admin/curriculum';

function row(page: Page, text: string): Locator {
  return page.getByRole('row').filter({ hasText: text });
}

test.describe('umdzidzisi-admin curriculum', () => {
  test.beforeEach(async ({ page }) => {
    await stubLmsGateway(page, { lms: LMS_FIXTURES });
  });

  test('examination boards list renders stubbed boards', async ({ page }) => {
    await page.goto(`${BASE}/boards`);

    await expect(
      page.getByRole('heading', { name: 'Examination Boards' }),
    ).toBeVisible();
    await expect(row(page, 'ZIMSEC')).toContainText('Zimbabwe');
    await expect(row(page, 'Cambridge')).toContainText('GB');
  });

  test('creating an examination board POSTs the form and shows a toast', async ({
    page,
  }) => {
    await page.goto(`${BASE}/boards`);
    await page.getByRole('button', { name: 'New Examination Board' }).click();

    const dialog: Locator = page.getByRole('dialog', {
      name: 'Create Examination Board',
    });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Name').fill('HEXCO');
    await dialog.getByLabel('Country').selectOption('ZW');
    await dialog.getByLabel('Website').fill('https://www.hexco.ac.zw');
    await dialog
      .getByLabel('Description')
      .fill('Higher Education Examinations');

    const postPromise: Promise<Request> = page.waitForRequest(
      isLmsRequest('examination-boards', 'POST'),
    );
    await dialog.getByRole('button', { name: 'Create Board' }).click();
    const post: Request = await postPromise;

    expect(post.postDataJSON()).toEqual({
      name: 'HEXCO',
      country: 'ZW',
      website: 'https://www.hexco.ac.zw',
      description: 'Higher Education Examinations',
    });
    await expect(page.getByText('Examination board created.')).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(row(page, 'HEXCO')).toBeVisible();
  });

  test('boards/:id opens the board drawer', async ({ page }) => {
    await page.goto(`${BASE}/boards/board-zimsec`);

    await expect(page.getByRole('dialog', { name: 'ZIMSEC' })).toBeVisible();
  });

  test('educational levels resolve their board name', async ({ page }) => {
    await page.goto(`${BASE}/levels`);

    await expect(
      page.getByRole('heading', { name: 'Educational Levels' }),
    ).toBeVisible();
    await expect(row(page, 'Ordinary Level')).toContainText('ZIMSEC');
    await expect(row(page, 'Advanced Level')).toContainText('Cambridge');

    await page.getByRole('button', { name: 'New Educational Level' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Create Educational Level' }),
    ).toBeVisible();
  });

  test('levels/:id opens the level drawer', async ({ page }) => {
    await page.goto(`${BASE}/levels/level-alevel`);

    await expect(
      page.getByRole('dialog', { name: 'Advanced Level' }),
    ).toBeVisible();
  });

  test('grades resolve their level and board', async ({ page }) => {
    await page.goto(`${BASE}/grades`);

    await expect(page.getByRole('heading', { name: 'Grades' })).toBeVisible();
    await expect(row(page, 'Form 3')).toContainText('Ordinary Level');
    await expect(row(page, 'Form 3')).toContainText('ZIMSEC');

    await page.getByRole('button', { name: 'New Grade' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Create Grade' }),
    ).toBeVisible();
  });

  test('grades/:id opens the grade drawer', async ({ page }) => {
    await page.goto(`${BASE}/grades/grade-upper6`);

    await expect(
      page.getByRole('dialog', { name: 'Upper Sixth' }),
    ).toBeVisible();
  });

  test('subjects resolve their board and level', async ({ page }) => {
    await page.goto(`${BASE}/subjects`);

    await expect(page.getByRole('heading', { name: 'Subjects' })).toBeVisible();
    const maths: Locator = row(page, 'Mathematics');
    await expect(maths).toContainText('ZIMSEC');
    await expect(maths).toContainText('Ordinary Level');
    const physics: Locator = row(page, 'Physics');
    await expect(physics).toContainText('Cambridge');
    await expect(physics).toContainText('Advanced Level');

    await page.getByRole('button', { name: 'New subject' }).click();
    await expect(
      page.getByRole('dialog', { name: 'New subject' }),
    ).toBeVisible();
  });

  test('subjects/:id opens the subject drawer', async ({ page }) => {
    await page.goto(`${BASE}/subjects/subject-physics`);

    await expect(page.getByRole('dialog', { name: 'Physics' })).toBeVisible();
  });

  test('topics resolve their subject and grade, and load with X-Limit', async ({
    page,
  }) => {
    const listRequest: Promise<Request> = page.waitForRequest(
      (request: Request): boolean =>
        isLmsRequest('topics')(request) &&
        request.headers()['x-limit'] !== undefined,
    );

    await page.goto(`${BASE}/topics`);

    const request: Request = await listRequest;
    expect(request.headers()['x-limit']).toBe('100');
    expect(request.headers()['x-page']).toBe('1');

    await expect(page.getByRole('heading', { name: 'Topics' })).toBeVisible();
    await expect(row(page, 'Algebra')).toContainText('Mathematics');
    await expect(row(page, 'Algebra')).toContainText('Form 3');
    await expect(row(page, 'Mechanics')).toContainText('Physics');
    await expect(row(page, 'Mechanics')).toContainText('Upper Sixth');

    await page.getByRole('button', { name: 'New topic' }).click();
    await expect(page.getByRole('dialog', { name: 'New topic' })).toBeVisible();
  });

  test('topics?subjectId= shows only that subject’s topics', async ({
    page,
  }) => {
    await page.goto(`${BASE}/topics?subjectId=subject-maths`);

    await expect(row(page, 'Algebra')).toBeVisible();
    await expect(row(page, 'Mechanics')).toHaveCount(0);
  });

  test('topics/:id opens the topic drawer', async ({ page }) => {
    await page.goto(`${BASE}/topics/topic-algebra`);

    await expect(page.getByRole('dialog', { name: 'Algebra' })).toBeVisible();
  });

  test('sub-topics resolve their topic and subject', async ({ page }) => {
    await page.goto(`${BASE}/sub-topics`);

    await expect(
      page.getByRole('heading', { name: 'Sub-topics' }),
    ).toBeVisible();
    await expect(row(page, 'Linear equations')).toContainText('Algebra');
    await expect(row(page, 'Linear equations')).toContainText('Mathematics');
    await expect(row(page, 'Kinematics')).toContainText('Mechanics');
    await expect(row(page, 'Kinematics')).toContainText('Physics');

    await page.getByRole('button', { name: 'New sub-topic' }).click();
    await expect(
      page.getByRole('dialog', { name: 'New sub-topic' }),
    ).toBeVisible();
  });

  test('sub-topics?topicId= shows only that topic’s sub-topics', async ({
    page,
  }) => {
    await page.goto(`${BASE}/sub-topics?topicId=topic-mechanics`);

    await expect(row(page, 'Kinematics')).toBeVisible();
    await expect(row(page, 'Linear equations')).toHaveCount(0);
  });

  test('sub-topics/:id opens the sub-topic drawer', async ({ page }) => {
    await page.goto(`${BASE}/sub-topics/sub-topic-linear`);

    await expect(
      page.getByRole('dialog', { name: 'Linear equations' }),
    ).toBeVisible();
  });
});
