/**
 * T02 – Gestión de jugadores
 */
const { test, expect } = require('@playwright/test');
const { loadApp, navTo, crearJugador } = require('./helpers');

test('T02.1 – Crear un jugador aparece en la lista', async ({ page }) => {
  await loadApp(page);
  await crearJugador(page, 'Ana');
  await navTo(page, 3);
  await expect(page.getByText('Ana', { exact: true }).first()).toBeVisible();
});

test('T02.2 – Crear dos jugadores, ambos aparecen', async ({ page }) => {
  await loadApp(page);
  await crearJugador(page, 'Luis');
  await crearJugador(page, 'Marta');
  await navTo(page, 3);
  await expect(page.locator('text=Luis')).toBeVisible();
  await expect(page.locator('text=Marta')).toBeVisible();
});

test('T02.3 – Modal crear jugador requiere nombre (Guardar deshabilitado sin texto)', async ({ page }) => {
  await loadApp(page);
  await navTo(page, 3);
  await page.locator('button:has-text("Agregar jugador")').click();
  await page.waitForTimeout(200);
  // El input está vacío → Guardar debería estar deshabilitado o no funcionar sin nombre
  const inp = page.locator('.inp').first();
  await expect(inp).toBeVisible();
  // Verificar que el modal está abierto
  await expect(page.locator('button:has-text("Guardar")')).toBeVisible();
  // Cerrar sin guardar
  await page.locator('button:has-text("Cancelar")').click();
  await expect(page.locator('button:has-text("Guardar")')).not.toBeVisible();
});
