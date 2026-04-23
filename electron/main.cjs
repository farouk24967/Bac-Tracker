const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

const isDev = process.argv.includes('--dev');

// ─── Browser Fixes ────────────────────────────────────────────────────────────
// Disable COOP so the main window and auth popup can communicate correctly.
// This is often required for Firebase Auth in Electron.
app.commandLine.appendSwitch('disable-features', 'CrossOriginOpenerPolicy');

let mainWindow;
let localServer; // Keep reference so we can close it on quit

// ─── Local HTTP server for production ────────────────────────────────────────
// Firebase Auth popups use window.opener.postMessage() to return tokens.
// Browsers (including Electron's Chromium) block postMessage from file:// origins.
// Serving via http://localhost fixes this — Firebase whitelists localhost by default.
const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

function startLocalServer(distPath) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Strip query strings and decode URI
      let urlPath = req.url.split('?')[0];
      try { urlPath = decodeURIComponent(urlPath); } catch (_) {}

      let filePath = path.join(distPath, urlPath === '/' ? 'index.html' : urlPath);

      // SPA fallback: any path that is not a real file → serve index.html
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    // Listen on 0.0.0.0 but load as localhost to match common auth presets
    const PORT = 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Electron] Local server running at http://localhost:${PORT}`);
      resolve({ server, port: PORT });
    });

    server.on('error', reject);
  });
}

// ─── Create main window ───────────────────────────────────────────────────────
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#f8fafc',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#0ea5e9'
    },
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      partition: 'persist:firebase_auth'
    }
  });

  // Load content
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // Serve dist via localhost so Firebase Auth popups can postMessage back
    const distPath = path.join(__dirname, '../dist');
    const { server, port } = await startLocalServer(distPath);
    localServer = server;
    mainWindow.loadURL(`http://localhost:${port}`);
    // Uncomment to debug production issues:
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message} (at ${sourceId}:${line})`);
  });

  // DEBUG: Allow everything to see where it goes
  mainWindow.webContents.setWindowOpenHandler((details) => {
    console.log('[DEBUG] Window open request URL:', details.url);
    
    // If it's the firebase auth popup, we still want our special preload
    const isAuth = details.url.includes('firebase') || details.url.includes('google');
    
    if (isAuth) {
       console.log('[Main] Auth window detected, injecting preload.');
       return {
         action: 'allow',
         overrideBrowserWindowOptions: {
           width: 500,
           height: 650,
           webPreferences: {
             nodeIntegration: false,
             contextIsolation: false,
             preload: path.join(__dirname, 'auth-popup-preload.cjs'),
             partition: 'persist:firebase_auth'
           }
         }
       };
    }

    console.log('[Main] Non-auth window, opening in system browser.');
    shell.openExternal(details.url);
    return { action: 'deny' };
  });



  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── IPC: Firebase Auth Relay ─────────────────────────────────────────────────
// The auth popup's preload intercepts window.opener.postMessage and sends it
// here. We forward it to the main window's renderer, which dispatches it as a
// real MessageEvent so Firebase SDK's internal listener picks it up.
ipcMain.on('firebase-auth-relay', (event, dataStr, senderOrigin) => {
  console.log('[Main] firebase-auth-relay received, forwarding to main window');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('firebase-auth-message', dataStr, senderOrigin);
  }
});

// ─── Debug Helpers ────────────────────────────────────────────────────────────
// Auto-open DevTools for ALL windows (including popups) so we can see
// errors inside the Firebase auth window.
app.on('browser-window-created', (event, window) => {
  console.log('[Main] New window created, opening DevTools');
  window.webContents.openDevTools({ mode: 'detach' });
});

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (localServer) localServer.close();
  if (process.platform !== 'darwin') app.quit();
});

