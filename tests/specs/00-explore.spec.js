const { test, expect } = require('@playwright/test');
const APP_URL = 'http://localhost:7777/app.html';

async function loadApp(page) {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  // Cerrar cookie banner si existe
  const ok = page.locator('button:has-text("Solo necesarias"), button:has-text("Aceptar")').first();
  if (await ok.count() > 0) await ok.click();
  await page.waitForTimeout(300);
}

test('explorar selectores DOM', async ({ page }) => {
  await loadApp(page);

  // Buscar nav
  const navHtml = await page.locator('nav, .nav, [class*=nav]').first().innerHTML().catch(() => 'NO NAV');
  console.log('NAV HTML:', navHtml.slice(0, 400));

  // Todos los botones
  const btns = await page.locator('button:visible').allTextContents();
  console.log('BTNS:', JSON.stringify(btns));

  // Buscar pestaña Ajustes / players
  const tabs = await page.locator('[class*=tab],[class*=nav]').allTextContents();
  console.log('TABS:', JSON.stringify(tabs.slice(0,10)));

  // Ver clases de botones de nav
  const navBtnClasses = await page.evaluate(() => {
    const els = document.querySelectorAll('nav button, footer button, .bottom-nav button');
    return [...els].map(e => ({ cls: e.className, txt: e.textContent.trim().slice(0,20) }));
  });
  console.log('NAV BTN CLASSES:', JSON.stringify(navBtnClasses));

  expect(true).toBe(true);
});
