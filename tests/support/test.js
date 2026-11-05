const { test: base, expect } = require('@playwright/test');
const path = require('node:path');

// Run the same interactions against the minified distribution in min projects.
const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    if (testInfo.project.metadata.minified) {
      await page.route('**/dist/dialog.js', route => route.fulfill({
        path: path.resolve(__dirname, '../../dist/dialog.min.js'),
        contentType: 'application/javascript'
      }));
    }
    await use(page);
  }
});

module.exports = { test, expect };
