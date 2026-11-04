const { test, expect } = require('@playwright/test');
const path = require('node:path');

const files = {
  '/': 'test/wrapper.html',
  '/src/dialog.js': 'src/dialog.js',
  '/src/polyfill/dialog.js': 'src/polyfill/dialog.js',
  '/src/polyfill/dialog.css': 'src/polyfill/dialog.css'
};

// Serve the actual shipped assets through the browser's request pipeline.
async function openFixture(page, fallback, failFirstStyle = false) {
  const resources = [];
  if (fallback) await page.addInitScript(() => {
    const prototype = HTMLDialogElement.prototype;
    delete prototype.show;
    delete prototype.showModal;
    delete prototype.close;
    window.HTMLDialogElement = undefined;
  });
  await page.route('http://component.test/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.includes('/polyfill/')) resources.push(pathname);
    if (failFirstStyle && pathname.endsWith('.css')) {
      failFirstStyle = false;
      return route.abort();
    }
    if (!files[pathname]) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ path: path.join(__dirname, '..', files[pathname]) });
  });
  await page.goto('http://component.test/');
  return resources;
}

for (const fallback of [false, true]) {
  test((fallback ? 'polyfill' : 'native') + ' supports submit, Escape, dismissal and reopening', async ({ page }) => {
    const resources = await openFixture(page, fallback);
    const dialog = page.locator('dialog');
    await page.locator('#launch').click();
    await page.locator('form button').click();
    await expect(page.locator('output')).toHaveText('yes');
    await page.locator('#launch').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('output')).toHaveText('Dismissed');
    await page.locator('#launch').click();
    await page.locator('#dismiss').click();
    await expect(dialog).not.toBeVisible();
    expect(await dialog.evaluate(el => el.returnValue)).toBe('cancel');
    await page.locator('#launch').click();
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    await page.mouse.click(bounds.x + 5, bounds.y + 5);
    await expect(dialog).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toBeVisible();
    expect(resources.length).toBe(fallback ? 2 : 0);
  });
}

test('retries a failed stylesheet without downloading the script twice', async ({ page }) => {
  const resources = await openFixture(page, true, true);
  expect(await page.evaluate(() => dialogPolyfillIfRequired(document.querySelector('dialog')).then(() => false, () => true))).toBe(true);
  await page.locator('#launch').click();
  await expect(page.locator('dialog')).toBeVisible();
  expect(resources.filter(url => url.endsWith('.js'))).toHaveLength(1);
  expect(resources.filter(url => url.endsWith('.css'))).toHaveLength(2);
});
