import {
  test,
  expect,
  type Locator,
  type Page,
  type Request,
} from '@playwright/test';
import { isLmsRequest, stubLmsGateway } from './support/lms-gateway';
import { LEARNER_USER, LMS_FIXTURES } from './support/lms-fixtures';

/**
 * Subscription plans, subscriptions and learner profiles in umdzidzisi-admin,
 * against a stubbed learning-management gateway. Subscribers and learners are
 * system users, resolved through `user-management-service/system-users`.
 */

const BASE: string = '/umdzidzisi-admin';

function row(page: Page, text: string): Locator {
  return page.getByRole('row').filter({ hasText: text });
}

test.describe('umdzidzisi-admin subscriptions and learners', () => {
  test.beforeEach(async ({ page }) => {
    await stubLmsGateway(page, {
      lms: LMS_FIXTURES,
      systemUsers: [LEARNER_USER],
    });
  });

  test('subscription plans resolve their level and board', async ({ page }) => {
    await page.goto(`${BASE}/subscriptions/plans`);

    await expect(
      page.getByRole('heading', { name: 'Subscription Plans' }),
    ).toBeVisible();
    const monthly: Locator = row(page, 'O Level Monthly');
    await expect(monthly).toContainText('Ordinary Level');
    await expect(monthly).toContainText('ZIMSEC');
    const weekly: Locator = row(page, 'A Level Weekly');
    await expect(weekly).toContainText('Advanced Level');
    await expect(weekly).toContainText('Cambridge');

    await page.getByRole('button', { name: 'New subscription plan' }).click();
    await expect(
      page.getByRole('dialog', { name: 'New subscription plan' }),
    ).toBeVisible();
  });

  test('plans?educationalLevelId= shows only that level’s plans', async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/subscriptions/plans?educationalLevelId=level-alevel`,
    );

    await expect(row(page, 'A Level Weekly')).toBeVisible();
    await expect(row(page, 'O Level Monthly')).toHaveCount(0);
  });

  test('plans/:id opens the plan drawer', async ({ page }) => {
    await page.goto(`${BASE}/subscriptions/plans/plan-olevel-monthly`);

    await expect(
      page.getByRole('dialog', { name: 'O Level Monthly' }),
    ).toBeVisible();
  });

  test('subscriptions resolve subscriber and plan, and load with X-Limit', async ({
    page,
  }) => {
    const listRequest: Promise<Request> = page.waitForRequest(
      (request: Request): boolean =>
        isLmsRequest('subscriptions')(request) &&
        request.headers()['x-limit'] !== undefined,
    );

    await page.goto(`${BASE}/subscriptions/all`);

    expect((await listRequest).headers()['x-limit']).toBe('100');
    await expect(
      page.getByRole('heading', { name: 'Subscriptions' }),
    ).toBeVisible();
    await expect(row(page, 'Rudo Chikore')).toContainText('O Level Monthly');
    await expect(row(page, 'Tendai Moyo')).toContainText('A Level Weekly');
  });

  test('all?subscriptionPlanId= shows only that plan’s subscriptions', async ({
    page,
  }) => {
    await page.goto(
      `${BASE}/subscriptions/all?subscriptionPlanId=plan-alevel-weekly`,
    );

    await expect(row(page, 'Tendai Moyo')).toBeVisible();
    await expect(row(page, 'Rudo Chikore')).toHaveCount(0);
  });

  test('all/:id opens the subscription drawer', async ({ page }) => {
    await page.goto(`${BASE}/subscriptions/all/subscription-rudo`);

    await expect(
      page.getByRole('dialog', { name: 'Rudo Chikore' }),
    ).toBeVisible();
  });

  test('learner profiles resolve user, level and grade', async ({ page }) => {
    await page.goto(`${BASE}/learners/profiles`);

    await expect(
      page.getByRole('heading', { name: 'Learner Profiles' }),
    ).toBeVisible();
    const rudo: Locator = row(page, 'Rudo Chikore');
    await expect(rudo).toContainText('Student');
    await expect(rudo).toContainText('Ordinary Level');
    await expect(rudo).toContainText('Form 3');

    await page.getByRole('button', { name: 'New profile' }).click();
    await expect(
      page.getByRole('dialog', { name: 'New profile' }),
    ).toBeVisible();
  });

  test('profiles/:id opens the profile drawer', async ({ page }) => {
    await page.goto(`${BASE}/learners/profiles/profile-rudo`);

    await expect(
      page.getByRole('dialog', { name: 'Rudo Chikore' }),
    ).toBeVisible();
  });
});
