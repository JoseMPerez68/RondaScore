/**
 * T01 – Carga y navegación básica
 */
const { test, expect } = require('@playwright/test');
const { loadApp, navTo } = require('./helpers');

test('T01.1 – La app carga y muestra RondaScore', async ({ page }) => {
  await loadApp(page);
  await expect(page.locator('.hdr-main').first()).toBeVisible();
});

test('T01.2 – Las 4 pestañas de navegación existen', async ({ page }) => {
  await loadApp(page);
  const tabs = page.locator('.nav-item');
  await expect(tabs).toHaveCount(4);
});

test('T01.3 – Botón Nueva partida visible en Inicio', async ({ page }) => {
  await loadApp(page);
  await expect(page.locator('button.btn-block:has-text("Nueva partida")')).toBeVisible();
});

test('T01.4 – Modal de nueva partida se abre y se puede cerrar con ✕', async ({ page }) => {
  await loadApp(page);
  await page.locator('button:has-text("Nueva partida")').first().click();
  await expect(page.locator('.modal')).toBeVisible();
  // Cerrar con el botón ✕ (aria-label="Cerrar")
  await page.locator('[aria-label="Cerrar"]').click();
  await expect(page.locator('.modal')).not.toBeVisible();
});

test('T01.5 – Pestaña Ajustes carga sin errores', async ({ page }) => {
  await loadApp(page);
  await navTo(page, 3);
  // Al menos debe verse algún contenido de ajustes
  const body = await page.locator('body').innerText();
  expect(body.length).toBeGreaterThan(50);
});
