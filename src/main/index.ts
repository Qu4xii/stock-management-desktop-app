// In src/main/index.ts

import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { clientsApi, productsApi, purchasesApi, staffApi ,repairsApi, historyApi, dashboardApi } from './lib/db';
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
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // --- CLIENTS IPC API ---
  ipcMain.handle('db:clients-getAll', () => clientsApi.getAll());
  ipcMain.handle('db:clients-add', (_event, data) => {
    const record = clientsApi.add(data);
    return clientsApi.getById(record.id);
  });
  ipcMain.handle('db:clients-update', (_event, data) => {
    clientsApi.update(data);
    return clientsApi.getById(data.id);
  });
  ipcMain.handle('db:clients-delete', (_event, id) => clientsApi.delete(id));

  // --- PRODUCTS IPC API ---
  ipcMain.handle('db:products-getAll', () => productsApi.getAll());
  ipcMain.handle('db:products-add', (_event, data) => {
    const record = productsApi.add(data);
    return productsApi.getById(record.id);
  });
  ipcMain.handle('db:products-update', (_event, data) => {
    productsApi.update(data);
    return productsApi.getById(data.id);
  });
  ipcMain.handle('db:products-delete', (_event, id) => productsApi.delete(id));
  
  // --- STAFF IPC API ---
  ipcMain.handle('db:staff-getAll', () => staffApi.getAll());
 ipcMain.handle('db:staff-add', async (_event, data) => {
  // The try...catch block from the previous version is still here, now it will
  // also catch errors from the updated 'add' function.
  try {
    return await staffApi.add(data);
  } catch(error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`A staff member with the email "${data.email}" already exists.`);
      }
      throw error;
  }
});
  ipcMain.handle('db:staff-update', (_event, data) => {
    staffApi.update(data);
    return staffApi.getById(data.id);
  });
  ipcMain.handle('db:staff-delete', (_event, id) => staffApi.delete(id));

  // --- PURCHASES IPC API ---
  ipcMain.handle('db:purchases-create', (_event, { clientId, items }) => {
    return purchasesApi.create(clientId, items);
  });
  ipcMain.handle('db:purchases-getForClient', (_event, clientId) => {
    return purchasesApi.getForClient(clientId);
  });

  // --- REPAIRS IPC API ---
  ipcMain.handle('db:repairs-getAll', async () => {
    try {
      return await repairsApi.getAll();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get all repairs:', error);
      throw error;
    }
  });
  
  // --- THIS IS THE FIX ---
  // Added the missing handler for getting repairs for a specific client.
  ipcMain.handle('db:repairs-getForClient', (_event, clientId) => {
    try {
      return repairsApi.getForClient(clientId);
    } catch (error) {
      console.error(`DATABASE ERROR - Failed to get repairs for client ${clientId}:`, error);
      throw error;
    }
  });

  ipcMain.handle('db:repairs-add', (_event, data) => {
    try {
      const record = repairsApi.add(data);
      return repairsApi.getById(record.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to add repair:', error);
      throw error;
    }
  });

  ipcMain.handle('db:repairs-update', (_event, data) => {
    try {
      repairsApi.update(data);
      return repairsApi.getById(data.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to update repair:', error);
      throw error;
    }
  });

  ipcMain.handle('db:repairs-delete', (_event, id) => {
    try {
      return repairsApi.delete(id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to delete repair:', error);
      throw error;
    }
  });
  ipcMain.handle('db:history-get', () => {
    try {
      return historyApi.get();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get combined history:', error);
      throw error;
    }
  });

  // --- DASHBOARD IPC API ---
  ipcMain.handle('db:dashboard-getStats', () => {
    try {
      return dashboardApi.getStats();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get dashboard stats:', error);
      throw error;
    }
  });
  
  ipcMain.handle('db:dashboard-getWorkOrdersByStatus', () => {
    try {
      return dashboardApi.getWorkOrdersByStatus();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get work orders by status:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getWorkOrdersByPriority', () => {
    try {
      return dashboardApi.getWorkOrdersByPriority();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get work orders by priority:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getDailySales', () => {
    try {
      return dashboardApi.getDailySales();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get daily sales:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getRecentPurchases', () => {
    try {
      return dashboardApi.getRecentPurchases();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get recent purchases:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getRecentRepairs', () => {
    try {
      return dashboardApi.getRecentRepairs();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get recent repairs:', error);
      throw error;
    }
  });
// --- AUTHENTICATION IPC API (CORRECTED) ---
  ipcMain.handle('db:auth-signUp', async (_event, data) => {
    // --- THIS IS THE FIX ---
    try {
      // Create the user in the database.
      const record = await staffApi.signUp(data);
      // Fetch the full, newly created user record to get all default values (like role).
      // The getById function already correctly removes the password hash.
      const newUser = staffApi.getById(record.id);
      return newUser;
    } catch (error) {
      // Log the specific error to the terminal for debugging.
      console.error('DATABASE ERROR - Failed to sign up:', error);
      // Re-throw the error so the frontend can display a user-friendly message.
      throw error;
    }
  });

  ipcMain.handle('db:auth-logIn', async (_event, { email, password }) => {
    try {
      return await staffApi.authenticate(email, password);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to log in:', error);
      throw error;
    }
  });
  
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});