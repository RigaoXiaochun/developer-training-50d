import { test, expect } from '@playwright/test';
for (const width of [320, 390, 768, 1440])
  for (const route of ['/', '/vue.html']) {
    test(`入口 ${route} ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath('page.png'),
        fullPage: true,
      });
    });
  }
const q = Number((process.env.QID ?? '').slice(1));
test('真实创建、搜索与刷新', async ({ page }) => {
  test.skip(!(q >= 9), 'Q09起检查真实联调，入口烟测不等于业务完成');
  await page.goto('/vue.html');
  await page.getByTestId('actor-select').selectOption('user-01');
  await page.getByTestId('new-ticket').click();
  const title = '真实浏览器验证-' + Date.now();
  await page.getByTestId('ticket-title-input').fill(title);
  await page
    .getByTestId('ticket-description-input')
    .fill('虚构训练数据，刷新必须保留。');
  await page.getByTestId('ticket-category-input').selectOption('support');
  const pending = page.waitForResponse(
    (r) => r.url().includes('/v1/tickets') && r.request().method() === 'POST',
  );
  await page.getByTestId('ticket-submit').click();
  const response = await pending;
  expect(response.status()).toBe(201);
  const body = await response.json();
  await page.getByTestId('ticket-search').fill(title);
  await expect(
    page.locator(`[data-ticket-id="${body.data.id}"]`),
  ).toBeVisible();
  await page.reload();
  await page.getByTestId('actor-select').selectOption('user-01');
  await page.getByTestId('ticket-search').fill(title);
  await expect(
    page.locator(`[data-ticket-id="${body.data.id}"]`),
  ).toBeVisible();
});
test('优先级URL与计数', async ({ page }) => {
  test.skip(!(q >= 16), 'Q16起检查新增优先级');
  await page.goto('/vue.html');
  await page.getByTestId('actor-select').selectOption('manager-01');
  await page.getByTestId('priority-filter').selectOption('high');
  await expect(page).toHaveURL(/priority=high/);
  await expect(page.getByTestId('priority-counts')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('priority-filter')).toHaveValue('high');
  await page.goto('/vue.html?priority=bad');
  await expect(page.getByTestId('priority-filter')).toHaveValue('all');
});
