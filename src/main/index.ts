// In src/main/index.ts

import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { clientsApi } from './lib/db' // <-- Import our new database API
import { productsApi } from './lib/db'; // <-- ADD productsApi HERE
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// --- THIS IS THE CRITICAL FIX ---
// We are removing all old IPC handlers and adding the new ones for our database.

app.whenReady().then(() => {

   console.log('[DATABASE] Testing database connection...')
  try {
    const clients = clientsApi.getAll()
    console.log(`[DATABASE] Success! Found ${clients.length} clients.`)
  } catch (error) {
    console.error('[DATABASE] Failed to connect to database:', error)
  }
  
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // --- CLIENTS IPC API ---
  // These are the backend listeners that our React app will call.

  // READ: Handle request to get all clients
  ipcMain.handle('db:clients-getAll', () => {
    return clientsApi.getAll()
  })
  
  // CREATE: Handle request to add a new client
  ipcMain.handle('db:clients-add', (_event, clientData) => {
    const newClientRecord = clientsApi.add(clientData)
    // After adding, we get the full record to return to the frontend
    return clientsApi.getById(newClientRecord.id)
  })

  // UPDATE: Handle request to update a client
  ipcMain.handle('db:clients-update', (_event, clientData) => {
    clientsApi.update(clientData)
    // After updating, we can return the updated record
    return clientsApi.getById(clientData.id)
  })

  // DELETE: Handle request to delete a client
  ipcMain.handle('db:clients-delete', (_event, clientId) => {
    clientsApi.delete(clientId)
  })

  // We will add IPC handlers for Products here later.
ipcMain.handle('db:products-getAll', () => {
    return productsApi.getAll();
  });

  ipcMain.handle('db:products-add', (_event, productData) => {
    const newRecord = productsApi.add(productData);
    return productsApi.getById(newRecord.id);
  });

  ipcMain.handle('db:products-update', (_event, productData) => {
    productsApi.update(productData);
    return productsApi.getById(productData.id);
  });

  ipcMain.handle('db:products-delete', (_event, productId) => {
    productsApi.delete(productId);
  });
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})