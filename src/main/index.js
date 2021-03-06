import { app, BrowserWindow, ipcMain } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import cli from 'commander';
import contextMenu from 'electron-context-menu';
import packageInfo from '../../package.json';
import initTestDataRunner from '../renderer/test_data';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const APP_NAME = 'Simple Inventory Manager';

async function main() {
  const isDevMode = process.execPath.match(/[\\/]electron/);

  if (isDevMode) {
    cli
      .version(packageInfo.version)
      .option('--create [class]', 'Create test data for [class]')
      .option('--remove [class]', 'Remove test data for [class]')
      .parse(process.argv);

    const userActions = ['create', 'remove']
      .reduce((accumulatedActions, currentAction) => (
        Object.assign(
          accumulatedActions,
          (typeof cli[currentAction] === 'string' ? { [currentAction]: cli[currentAction] } : {}),
        )
      ),
      {},
    );

    if (Object.keys(userActions).length) {
      await initTestDataRunner(userActions, () => process.exit());
      return;
    }

    enableLiveReload({ strategy: 'react-hmr' });
  }

  const createWindow = async () => {
    app.setName(APP_NAME);

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
    });

    contextMenu();

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/../../app/index.html`);

    // Open the DevTools.
    if (isDevMode) {
      await installExtension(REACT_DEVELOPER_TOOLS);
      mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
  };

  // The BrowserWindow is hidden until the React component App is mounted.
  // The App component's componentDidMount handler uses ipcRenderer to
  // let the main thread know that it can show the BrowserWindow.
  ipcMain.once('show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });


  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    createWindow();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });
}

main();
