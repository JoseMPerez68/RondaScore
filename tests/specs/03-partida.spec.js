/**
 * T03 – Inicio y flujo de partida
 */
const { test, expect } = require('@playwright/test');
const { loadApp, navTo, crearJugador, iniciarPartidaCarioca } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await loadApp(page);
  await crearJugador(page, 'Jose');
  await crearJugador(page, 'Gracie');
  await crearJugador(page, 'Pedro');
});

test('T03.1 – El wizard de nueva partida tiene 3 pasos', async ({ page }) => {
  await navTo(page, 0);
  await page.locator('button:has-text("Nueva partida")').first().click();
  await page.waitForTimeout(300);
  // Paso 1: debe mostrar tipos de juego
  await expect(page.locator('.gt-card').first()).toBeVisible();
  // Indicadores de pasos
  const dots = page.locator('.step-dot');
  await expect(dots).toHaveCount(3);
});

test('T03.2 – Iniciar partida Carioca con 3 jugadores navega a vista Partida', async ({ page }) => {
  await iniciarPartidaCarioca(page, ['Jose', 'Gracie', 'Pedro']);
  await navTo(page, 1); // pestaña Partida
  const body = await page.locator('body').innerText();
  // Debe mostrar al menos un nombre de jugador o "Ronda"
  expect(body).toMatch(/Jose|Gracie|Pedro|Ronda|ronda/i);
});

test('T03.3 – Vista Partida muestra marcador con los 3 jugadores', async ({ page }) => {
  await iniciarPartidaCarioca(page, ['Jose', 'Gracie', 'Pedro']);
  await navTo(page, 1);
  await page.waitForTimeout(500);
  const body = await page.locator('body').innerText();
  expect(body).toContain('Jose');
  expect(body).toContain('Gracie');
  expect(body).toContain('Pedro');
});

test('T03.4 – Botón Registrar ronda visible en partida activa', async ({ page }) => {
  await iniciarPartidaCarioca(page, ['Jose', 'Gracie']);
  await navTo(page, 1);
  const registrarBtn = page.locator('button:has-text("Registrar"), button:has-text("ronda")').first();
  await expect(registrarBtn).toBeVisible({ timeout: 5000 });
});

test('T03.5 – Cancelar nueva partida con ✕ no borra partida activa existente', async ({ page }) => {
  await iniciarPartidaCarioca(page, ['Jose', 'Gracie']);
  await navTo(page, 0);
  // Intentar nueva partida y cancelar
  await page.locator('button:has-text("Nueva partida")').first().click();
  await page.waitForTimeout(300);
  await page.locator('[aria-label="Cerrar"]').click();
  await page.waitForTimeout(200);
  // La partida sigue activa
  await navTo(page, 1);
  await expect(page.locator('.score-name').filter({ hasText: 'Jose' }).first()).toBeVisible();
});
