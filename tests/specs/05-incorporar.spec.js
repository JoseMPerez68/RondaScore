/**
 * T05 – Incorporar jugador a mitad de partida
 */
const { test, expect } = require('@playwright/test');
const { loadApp, navTo, crearJugador, iniciarPartidaCarioca } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await loadApp(page);
  await crearJugador(page, 'Ana');
  await crearJugador(page, 'Bob');
  await crearJugador(page, 'Carlos'); // jugador extra para incorporar
  await iniciarPartidaCarioca(page, ['Ana', 'Bob']);
  await navTo(page, 1);
  await page.waitForTimeout(500);
});

test('T05.1 – Botón "+ Jugador" visible en partida activa', async ({ page }) => {
  const addBtn = page.locator('button:has-text("Jugador")').first();
  await expect(addBtn).toBeVisible({ timeout: 5000 });
});

test('T05.2 – "+ Jugador" abre modal de incorporación (no el formulario estándar)', async ({ page }) => {
  await page.locator('button:has-text("Jugador")').first().click();
  await page.waitForTimeout(400);
  // NO debe mostrar "Guardar" (sería el formulario estándar)
  // SÍ debe mostrar algún jugador disponible o texto de selección
  const modalText = await page.locator('.modal, .overlay').first().innerText().catch(() => '');
  expect(modalText).not.toContain('NOMBRE'); // el formulario estándar tiene "NOMBRE"
});

test('T05.3 – Carlos aparece en la lista de jugadores disponibles para incorporar', async ({ page }) => {
  await page.locator('button:has-text("Jugador")').first().click();
  await page.waitForTimeout(400);
  const modalText = await page.locator('.modal, .overlay').first().innerText().catch(() => '');
  expect(modalText).toContain('Carlos');
});

test('T05.4 – Después de incorporar Carlos aparece en el marcador', async ({ page }) => {
  await page.locator('button:has-text("Jugador")').first().click();
  await page.waitForTimeout(400);

  // Seleccionar Carlos
  await page.locator('text=Carlos').first().click();
  await page.waitForTimeout(400);

  // Paso: Incorporar ✓ o Continuar
  const incorporarBtn = page.locator('button:has-text("Incorporar"), button:has-text("Continuar")').first();
  if (await incorporarBtn.count() > 0) {
    await incorporarBtn.click();
    await page.waitForTimeout(500);
  }

  // Carlos debe aparecer en el marcador
  const body = await page.locator('body').innerText();
  expect(body).toContain('Carlos');
});

test('T05.5 – Modal incorporación se puede cerrar con Cancelar', async ({ page }) => {
  await page.locator('button:has-text("Jugador")').first().click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Cancelar")').first().click();
  await page.waitForTimeout(300);
  // Modal debe cerrarse
  const overlayVisible = await page.locator('.overlay').first().isVisible().catch(() => false);
  expect(overlayVisible).toBe(false);
});
