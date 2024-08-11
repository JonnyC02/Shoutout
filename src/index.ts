import { app, BrowserWindow } from 'electron';  // Use ES module import
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow(): void {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),  // You might want to convert `preload.js` to TypeScript too
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadURL(
        `file://${path.join(__dirname, '../src/index.html')}`  // Bundled file
    );
}

app.whenReady().then((): void => {
    createWindow();

    app.on('activate', (): void => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', (): void => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
