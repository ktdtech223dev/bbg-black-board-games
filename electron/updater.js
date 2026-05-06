let autoUpdater;
try {
  ({ autoUpdater } = require('electron-updater'));
} catch (e) {
  autoUpdater = null;
}

function setupUpdater(mainWindow) {
  if (!autoUpdater) return;
  try {
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-available', () => mainWindow?.webContents.send('update:available'));
    autoUpdater.on('update-downloaded', () => mainWindow?.webContents.send('update:ready'));
  } catch (e) { console.warn('Updater failed:', e.message); }
}

module.exports = { setupUpdater };
