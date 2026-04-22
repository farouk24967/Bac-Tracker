const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add required IPC methods here later if needed
  // Example:
  // ping: () => ipcRenderer.invoke('ping'),
});
