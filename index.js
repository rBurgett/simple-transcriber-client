const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const isDev = require('electron-is-dev');
const fs = require('fs-extra-promise');
const path = require('path');
// const { autoUpdater } = require('electron-updater');

const { platform } = process;
require('electron-context-menu')();

app.on('ready', () => {

  const appWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: platform === 'win32' ? 620 : platform === 'darwin' ? 600 : 580,
    webPreferences: {
      nodeIntegration: true
    }
  });

  appWindow.toggleDevTools();

  appWindow.once('ready-to-show', () => {
    require('electron-context-menu')();
    appWindow.show();
  });

  appWindow.loadURL(`file://${__dirname}/public/index.html`);

  if(platform === 'darwin') {
    const menuTemplate = [];
    // File Menu
    menuTemplate.push({
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    });
    // Edit Menu
    menuTemplate.push({
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    });
    // Window Menu
    if(isDev) {
      menuTemplate.push({
        label: 'Window',
        submenu: [
          { label: 'Show Dev Tools', role: 'toggledevtools' }
        ]
      });
    }
    const appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);
  }

});

ipcMain.on('getVersion', e => {
  const { version } = fs.readJsonSync(path.join(__dirname, 'package.json'));
  e.returnValue = version;
});

// Properly close the application
app.on('window-all-closed', () => {
  app.quit();
});

// Check for updates and automatically install
// if(!isDev) autoUpdater.checkForUpdates();
