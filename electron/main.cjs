const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show immediately to prevent white flash
    backgroundColor: '#f8fafc', // slate-50 to match background
    titleBarStyle: 'hidden', // hides native title bar but keeps controls on Mac/optionally Windows
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#0ea5e9'
    }, // native windows 11 styling if desired
    autoHideMenuBar: true, // Hide file/edit/view menu
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Load content
  if (isDev) {
    // In dev mode, wait for Vite dev server before loading
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools automatically if desired: mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML bundle
    // __dirname is the `electron` folder, we need to go up to `dist`
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready to stop white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message} (at ${sourceId}:${line})`);
  });

  // Handle external links (open in default browser instead of electron window)
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
