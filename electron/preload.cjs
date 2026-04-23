const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Existing API placeholder
});

// ─── Firebase Auth Bridge ─────────────────────────────────────────────────────
// The auth popup's preload sends 'firebase-auth-relay' to main process.
// Main process forwards it here as 'firebase-auth-message'.
// We expose a listener so the renderer can dispatch it as a real MessageEvent,
// which Firebase SDK's internal 'message' listener will receive and process.
contextBridge.exposeInMainWorld('electronAuthBridge', {
  onFirebaseMessage(callback) {
    ipcRenderer.on('firebase-auth-message', (_event, dataStr, senderOrigin) => {
      try {
        const data = JSON.parse(dataStr);
        callback(data, senderOrigin);
      } catch (e) {
        console.error('[Preload] Failed to parse firebase-auth-message:', e);
      }
    });
  },
});
