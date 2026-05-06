const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let autoUpdater = null;
try { autoUpdater = require('electron-updater').autoUpdater; } catch (e) {}

let mainWindow;
let serverProcess;

function startServer() {
  const serverPath = path.join(__dirname, '../server/index.js');
  serverProcess = fork(serverPath, [], {
    env: { ...process.env, PORT: '3847' }
  });
  serverProcess.on('error', console.error);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 1024, minHeight: 600,
    backgroundColor: '#050508',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('http://localhost:3847');
  }

  mainWindow.webContents.on('ipc-message', (e, channel, data) => {
    if (channel === 'ngames:event') {
      console.log('N Games event:', data);
    }
  });
}

if (autoUpdater) {
  try {
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-available', () => mainWindow?.webContents.send('update:available'));
    autoUpdater.on('update-downloaded', () => mainWindow?.webContents.send('update:ready'));
  } catch (e) {}
}

ipcMain.handle('update:install', () => autoUpdater?.quitAndInstall());
ipcMain.handle('win:minimize', () => mainWindow?.minimize());
ipcMain.handle('win:maximize', () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('win:close', () => {
  serverProcess?.kill();
  mainWindow?.close();
});

ipcMain.handle('host:get-ip', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
});

app.whenReady().then(() => {
  startServer();
  setTimeout(createWindow, 1500);
});

app.on('will-quit', () => serverProcess?.kill());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
