const path = require('path');
const APP_URL = 'http://localhost:7777/app.html';

async function loadApp(page) {
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  // Cerrar cookie banner si aparece
  const cookieBtn = page.locator('button:has-text("Solo necesarias")');
  if (await cookieBtn.count() > 0) await cookieBtn.click();
  await page.waitForTimeout(300);
}

/** Navega a una pestaña por índice (0=Inicio,1=Partida,2=Historial,3=Ajustes) */
async function navTo(page, idx) {
  await page.locator('.nav-item').nth(idx).click();
  await page.waitForTimeout(300);
}

/** Crea un jugador desde Ajustes > Jugadores */
async function crearJugador(page, nombre) {
  await navTo(page, 3); // Ajustes
  // Subtab Jugadores
  const jugadoresTab = page.locator('text=Jugadores').first();
  await jugadoresTab.click();
  await page.waitForTimeout(200);
  // Botón agregar
  await page.locator('button:has-text("Agregar jugador")').click();
  await page.waitForTimeout(200);
  await page.locator('.inp').first().fill(nombre);
  await page.locator('button:has-text("Guardar")').click();
  await page.waitForTimeout(300);
}

/** Inicia una partida Carioca con los jugadores indicados (deben existir) */
async function iniciarPartidaCarioca(page, nombresJugadores) {
  await navTo(page, 0); // Inicio
  await page.locator('button:has-text("Nueva partida")').first().click();
  await page.waitForSelector('.modal', { timeout: 5000 });
  await page.waitForTimeout(300);

  // Paso 1: seleccionar tipo Carioca (primera tarjeta)
  await page.locator('.gt-card').first().click();
  await page.waitForTimeout(400);

  // Paso 2: seleccionar jugadores
  for (const nombre of nombresJugadores) {
    const chip = page.locator('.player-chip').filter({ hasText: nombre });
    if (await chip.count() > 0) {
      await chip.first().click();
    }
    await page.waitForTimeout(200);
  }

  // Siguiente / Iniciar
  let nextBtn = page.locator('button:has-text("Siguiente")');
  if (await nextBtn.count() > 0) await nextBtn.click();
  await page.waitForTimeout(300);

  let iniciarBtn = page.locator('button:has-text("Iniciar partida")');
  if (await iniciarBtn.count() > 0) await iniciarBtn.first().click();
  await page.waitForTimeout(500);
}

module.exports = { APP_URL, loadApp, navTo, crearJugador, iniciarPartidaCarioca };
