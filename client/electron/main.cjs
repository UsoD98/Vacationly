const {
  app,
  autoUpdater,
  BrowserWindow,
  Menu,
  nativeImage,
  Notification,
  Tray,
} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { loadElectronEnv } = require('./env.cjs');

const isDev = !app.isPackaged;
loadElectronEnv(isDev ? 'development' : 'production');

const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
const appIconPath = path.join(__dirname, 'assets', 'app.ico');
const hasUpdateConfig =
  !isDev && fs.existsSync(path.join(process.resourcesPath, 'app-update.yml'));

let mainWindow = null;
let tray = null;
let isQuitting = false;

function loadIcon() {
  return nativeImage.createFromPath(appIconPath);
}

function showWindow() {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.setSkipTaskbar(false);
  mainWindow.focus();
}

function hideWindow() {
  if (!mainWindow) {
    return;
  }

  mainWindow.hide();
  mainWindow.setSkipTaskbar(true);
}

function createTray() {
  if (isDev || tray) {
    return;
  }

  tray = new Tray(loadIcon());
  tray.setToolTip('Vacationly');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '열기', click: showWindow },
      { type: 'separator' },
      {
        label: '업데이트 확인',
        enabled: hasUpdateConfig,
        click: () => autoUpdater.checkForUpdatesAndNotify(),
      },
      { type: 'separator' },
      {
        label: '종료',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      hideWindow();
      return;
    }

    showWindow();
  });

  tray.on('double-click', showWindow);
}

function setupAutoUpdater() {
  if (isDev || !hasUpdateConfig) {
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', () => {
    new Notification({
      title: '업데이트 확인',
      body: '새 버전을 다운로드하고 있습니다.',
    }).show();
  });

  autoUpdater.on('update-downloaded', () => {
    new Notification({
      title: '업데이트 준비 완료',
      body: '앱을 재시작하면 최신 버전이 적용됩니다.',
    }).show();
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto update error:', error);
  });

  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.error('Auto update check failed:', error);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#0f172a',
    icon: appIconPath,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.setMenu(null);

  mainWindow.once('ready-to-show', () => {
    showWindow();
  });

  mainWindow.on('minimize', (event) => {
    if (isDev) {
      return;
    }

    event.preventDefault();
    hideWindow();
  });

  mainWindow.on('close', (event) => {
    if (isDev || isQuitting) {
      return;
    }

    event.preventDefault();
    hideWindow();
  });

  if (isDev) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.vacationly.app');

  createWindow();
  createTray();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
});
