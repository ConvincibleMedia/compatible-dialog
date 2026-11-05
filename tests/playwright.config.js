const path = require('node:path');

const port = Number(process.env.TEST_PORT) || 4176;

// Each engine runs against both consumable bundles.
module.exports = {
  testDir: './browser',
  timeout: 30000,
  workers: 3,
  forbidOnly: !!process.env.CI,
  outputDir: './results',
  reporter: [['list'], ['html', { outputFolder: path.join(__dirname, 'report'), open: 'never' }]],
  use: {
    baseURL: 'http://localhost:' + port,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: ['chromium', 'firefox', 'webkit'].flatMap(browserName =>
    [false, true].map(minified => ({
      name: browserName + (minified ? '-min' : ''),
      use: { browserName },
      metadata: { minified }
    }))
  ),
  webServer: {
    command: 'node tests/support/server.js',
    cwd: path.resolve(__dirname, '..'),
    env: { PORT: String(port) },
    url: 'http://localhost:' + port,
    reuseExistingServer: false
  }
};
