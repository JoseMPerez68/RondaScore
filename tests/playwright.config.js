const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './specs',
  timeout: 30000,
  use: {
    headless: true,
    launchOptions: {
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    },
    // Limpiar localStorage entre tests
    storageState: { cookies: [], origins: [] },
  },
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
});
