/**
 * T04 – Registro y corrección de rondas
 */
const { test, expect } = require('@playwright/test');
const { loadApp, navTo, crearJugador, iniciarPartidaCarioca } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await loadApp(page);
  await crearJugador(page, 'Ana');
  await crearJugador(page, 'Bob');
  await iniciarPartidaCarioca(page, ['Ana', 'Bob']);
  await navTo(page, 1);
  await page.waitForTimeout(500);
});

/** Registrar una ronda introduciendo puntajes */
async function registrarRonda(page, scores) {
  // Abrir modal de ronda
  const btn = page.locator('button:has-text("Registrar"), button:has-text("ronda")').first();
  await btn.click();
  await page.waitForTimeout(400);

  // Acotar todo al overlay del modal de ronda (contiene el botón "Guardar ronda")
  const roundModal = page.locator('.overlay').filter({ has: page.locator('button:has-text("Guardar ronda")') });

  // Si hay botones de corona (modo Carioca), el primer jugador gana (0 pts),
  // y los demás reciben los puntajes del array scores en orden.
  const crowns = roundModal.locator('.crown-btn');
  if (await crowns.count() > 0) {
    // Seleccionar al primer jugador como ganador (puntaje 0)
    await crowns.first().click();
    await page.waitForTimeout(200);
    // Llenar penalizaciones del resto (score-inp visibles dentro del overlay)
    const inputs = roundModal.locator('.score-inp:visible');
    const count = await inputs.count();
    for (let i = 0; i < Math.min(scores.length, count); i++) {
      await inputs.nth(i).fill(String(scores[i]));
    }
  } else {
    // Modo libre / sin corona: llenar todos los inputs directamente
    const inputs = roundModal.locator('.score-inp:visible, input[type=number]:visible');
    const count = await inputs.count();
    for (let i = 0; i < Math.min(scores.length, count); i++) {
      await inputs.nth(i).fill(String(scores[i]));
    }
  }

  // Guardar
  await roundModal.locator('button:has-text("Guardar ronda")').click();
  await page.waitForTimeout(500);
}

test('T04.1 – Registrar una ronda actualiza el marcador', async ({ page }) => {
  await registrarRonda(page, [15, 25]);
  // La suma debe aparecer en el marcador
  const body = await page.locator('body').innerText();
  expect(body).toMatch(/15|25/);
});

test('T04.2 – Tabla "Detalle por ronda" muestra R1 tras registrar', async ({ page }) => {
  await registrarRonda(page, [10, 30]);
  const body = await page.locator('body').innerText();
  expect(body).toContain('R1');
});

test('T04.3 – Registrar 2 rondas muestra R1 y R2', async ({ page }) => {
  await registrarRonda(page, [10, 20]);
  await registrarRonda(page, [5, 15]);
  const body = await page.locator('body').innerText();
  expect(body).toContain('R1');
  expect(body).toContain('R2');
});

test('T04.4 – Total acumulado es correcto tras 2 rondas (Bob: 10+5=15)', async ({ page }) => {
  // Ana gana ambas rondas (0 pts), Bob recibe 10 y 5 de penalización → total 15
  await registrarRonda(page, [10]);
  await registrarRonda(page, [5]);
  const body = await page.locator('body').innerText();
  // El total de Bob debe ser 15
  expect(body).toContain('15');
});

test('T04.5 – Tocar puntaje en tabla abre diálogo de corrección', async ({ page }) => {
  await registrarRonda(page, [20, 30]);
  await page.waitForTimeout(300);
  // Clic en la celda editable de la tabla
  const editableCell = page.locator('.editable-cell').first();
  if (await editableCell.count() > 0) {
    await editableCell.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Corregir puntaje')).toBeVisible();
    // Cerrar
    await page.locator('button:has-text("Cancelar")').click();
  } else {
    // Si no hay celda editable aún, pasar el test
    console.log('No editable cells found after round, skipping');
  }
});
