const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bbg', {
  minimize: () => ipcRenderer.invoke('win:minimize'),
  maximize: () => ipcRenderer.invoke('win:maximize'),
  close: () => ipcRenderer.invoke('win:close'),
  getLocalIP: () => ipcRenderer.invoke('host:get-ip'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateAvailable: (cb) => ipcRenderer.on('update:available', cb),
  onUpdateReady: (cb) => ipcRenderer.on('update:ready', cb),
  dispatchAchievement: (data) => ipcRenderer.send('ngames:event', { type: 'achievement', ...data }),
  dispatchGameStart: (data) => ipcRenderer.send('ngames:event', { type: 'game_start', ...data }),
  dispatchGameEnd: (data) => ipcRenderer.send('ngames:event', { type: 'game_end', ...data }),
});
