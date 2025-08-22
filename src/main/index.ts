// File: src/main/index.ts

import { app, shell, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import * as PDFKit from 'pdfkit'
import {
  clientsApi,
  productsApi,
  purchasesApi,
  staffApi,
  repairsApi,
  historyApi,
  dashboardApi,
  exportApi
} from './lib/db'
import { StaffMember } from '../renderer/src/types' // [SECURITY] Import StaffMember for session typing
import { hasPermission } from './lib/permissions' // [SECURITY] Import our permission checker

const PDFDocument = require('pdfkit-table')

// [SECURITY] Step 1: User Session Management
// This Map will store the authenticated user for each application window.
// Key: window.id (number), Value: StaffMember object
const userSessions = new Map<number, StaffMember>()

function registerIpcHandlers(): void {
  // [SECURITY] Step 2: Helper to get the user associated with an IPC event
  const getUserFromEvent = (event: IpcMainInvokeEvent): StaffMember | undefined => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return undefined
    return userSessions.get(window.id)
  }

  // [SECURITY] Step 3: The Permission-Checking Wrapper
  /**
   * Wraps a database handler with a permission check.
   * @param requiredPermission The permission string (e.g., 'clients:read')
   * @param handler The function to execute if the user has permission.
   * @returns An IPC handler function that enforces security.
   */
  const protectedHandler = <T extends (...args: any[]) => any>(
    requiredPermission: string,
    handler: T
  ) => {
    return async (event: IpcMainInvokeEvent, ...args: Parameters<T>): Promise<ReturnType<T>> => {
      const user = getUserFromEvent(event)

      // Rule 1: Must be logged in
      if (!user) {
        console.error(`[AUTH] Unauthorized: No user session found for this request.`);
        throw new Error('Authentication Required. Please log in again.')
      }

      // Rule 2: Must have the required permission
      if (!hasPermission(user.role, requiredPermission)) {
        console.error(
          `[AUTH] FORBIDDEN: User '${user.email}' (Role: ${user.role}) attempted to perform action '${requiredPermission}' without permission.`
        )
        throw new Error('Unauthorized: You do not have permission to perform this action.')
      }

      // If checks pass, execute the original handler
      return handler(...args)
    }
  }

  // =========================
  // AUTHENTICATION & SESSION HANDLERS (Unprotected)
  // =========================
  ipcMain.handle('db:auth-signUp', async (event, data) => {
    try {
      const record = await staffApi.signUp(data)
      const user = await staffApi.getById(record.id)
      if (!user) throw new Error('Failed to retrieve user after sign up')

      // [SECURITY] Associate the new user with the window that signed up
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) userSessions.set(window.id, user)

      return user
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('db:auth-logIn', async (event, { email, password }) => {
    try {
      const user = await staffApi.authenticate(email, password)
      if (!user) throw new Error('Authentication failed - invalid credentials')

      // [SECURITY] Associate the logged-in user with their window
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) userSessions.set(window.id, user)

      return user
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      throw new Error(errorMessage)
    }
  })

  // [SECURITY] Add a logout handler to clear the session
  ipcMain.handle('auth:logOut', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window && userSessions.has(window.id)) {
      const userEmail = userSessions.get(window.id)?.email
      userSessions.delete(window.id)
      console.log(`[AUTH] User ${userEmail} logged out successfully. Session cleared.`)
    }
    return { success: true }
  })

  // =========================
  // CLIENTS IPC HANDLERS (Now Protected)
  // =========================
  ipcMain.handle('db:clients-getAll', protectedHandler('clients:read', () => clientsApi.getAll()))

  ipcMain.handle(
    'db:clients-add',
    protectedHandler('clients:create', async (data) => {
      const record = await clientsApi.add(data)
      return clientsApi.getById(record.id)
    })
  )

  ipcMain.handle(
    'db:clients-update',
    protectedHandler('clients:update', async (data) => {
      await clientsApi.update(data)
      return clientsApi.getById(data.id)
    })
  )

  ipcMain.handle('db:clients-delete', protectedHandler('clients:delete', (id) => clientsApi.delete(id)))

  // =========================
  // PRODUCTS IPC HANDLERS (Now Protected)
  // =========================
  ipcMain.handle('db:products-getAll', protectedHandler('products:read', () => productsApi.getAll()))

  ipcMain.handle(
    'db:products-add',
    protectedHandler('products:create', async (data) => {
      const record = await productsApi.add(data)
      return productsApi.getById(record.id)
    })
  )

  ipcMain.handle(
    'db:products-update',
    protectedHandler('products:update', async (data) => {
      await productsApi.update(data)
      return productsApi.getById(data.id)
    })
  )

  ipcMain.handle(
    'db:products-delete',
    protectedHandler('products:delete', (id) => productsApi.delete(id))
  )

  // =========================
  // STAFF IPC HANDLERS (Now Protected)
  // =========================
  // Special handler for staff: Technicians can only see themselves
  ipcMain.handle('db:staff-getAll', async (event) => {
    const user = getUserFromEvent(event)
    if (!user) throw new Error('Authentication Required.')
    
    // Managers and Cashiers can see everyone
    if (hasPermission(user.role, 'staff:read')) {
      return staffApi.getAll()
    }
    // Technicians can only read their own profile data
    if (hasPermission(user.role, 'staff:read-self')) {
      const self = await staffApi.getById(user.id)
      return self ? [self] : [] // Return as an array to match function signature
    }
    throw new Error('Unauthorized')
  })

  ipcMain.handle(
    'db:staff-add',
    protectedHandler('staff:create', (data) => staffApi.add(data))
  )
  
  ipcMain.handle(
    'db:staff-update',
    protectedHandler('staff:update', async (data) => {
      await staffApi.update(data)
      return staffApi.getById(data.id)
    })
  )

  ipcMain.handle('db:staff-delete', protectedHandler('staff:delete', (id) => staffApi.delete(id)))


  // =========================
  // REPAIRS IPC HANDLERS (SPECIAL CASES)
  // =========================
  // This needs custom logic for Technicians
  ipcMain.handle('db:repairs-getAll', async (event) => {
    const user = getUserFromEvent(event)
    if (!user) throw new Error('Authentication Required.')
    
    // Managers and Cashiers can read all repairs
    if (hasPermission(user.role, 'repairs:read')) {
      return repairsApi.getAll()
    }
    // Technicians can only read repairs assigned to them
    if (hasPermission(user.role, 'repairs:read-assigned')) {
      return repairsApi.getForStaff(user.id) // Assumes you will create this DB function
    }
    throw new Error('Unauthorized')
  })

  // This needs custom logic for Technicians to self-assign
  ipcMain.handle('db:repairs-add', async (event, data) => {
    const user = getUserFromEvent(event)
    if (!user) throw new Error('Authentication Required.')
    if (!hasPermission(user.role, 'repairs:create')) throw new Error('Unauthorized')

    // [SECURITY] Enforce Technician self-assignment rule
    if (user.role === 'Technician') {
      data.staffId = user.id
    }
    
    const record = await repairsApi.add(data)
    return repairsApi.getById(record.id)
  })

  // This needs custom logic for Technicians to only update their own
  ipcMain.handle('db:repairs-update', async (event, data) => {
    const user = getUserFromEvent(event)
    if (!user) throw new Error('Authentication Required.')

    // [SECURITY] First, check basic update permission
    const canUpdateAny = hasPermission(user.role, 'repairs:update')
    const canUpdateAssigned = hasPermission(user.role, 'repairs:update-assigned')
    if (!canUpdateAny && !canUpdateAssigned) throw new Error('Unauthorized')

    // [SECURITY] If Technician, enforce ownership and self-assignment
    if (user.role === 'Technician') {
      const existingRepair = await repairsApi.getById(data.id)
      if (existingRepair.staffId !== user.id) {
        throw new Error('Unauthorized: Technicians can only update repairs assigned to them.')
      }
      data.staffId = user.id // Re-enforce self-assignment on update
    }
    
    await repairsApi.update(data)
    return repairsApi.getById(data.id)
  })

  // Standard protected handler is fine for delete (only Manager has this)
  ipcMain.handle('db:repairs-delete', protectedHandler('repairs:delete', (id) => repairsApi.delete(id)))


  // =========================
  // OTHER PROTECTED HANDLERS
  // =========================
  ipcMain.handle('db:repairs-getForClient', protectedHandler('clients:read', (clientId) => repairsApi.getForClient(clientId)))

  ipcMain.handle(
    'db:purchases-create',
    protectedHandler('clients:create-purchase', ({ clientId, items }) =>
      purchasesApi.create(clientId, items)
    )
  )

  ipcMain.handle(
    'db:purchases-getForClient',
    protectedHandler('clients:read', (clientId) => purchasesApi.getForClient(clientId))
  )

  ipcMain.handle('db:history-get', protectedHandler('history:read', () => historyApi.get()))

  // Dashboard handlers (we'll need to create limited versions for some roles later)
  ipcMain.handle(
    'db:dashboard-getStats',
    protectedHandler('dashboard:read-all', () => dashboardApi.getStats())
  )
  ipcMain.handle(
    'db:dashboard-getWorkOrdersByStatus',
    protectedHandler('dashboard:read-all', () => dashboardApi.getWorkOrdersByStatus())
  )
  ipcMain.handle(
    'db:dashboard-getWorkOrdersByPriority',
    protectedHandler('dashboard:read-all', () => dashboardApi.getWorkOrdersByPriority())
  )
  ipcMain.handle(
    'db:dashboard-getDailySales',
    protectedHandler('dashboard:read-all', () => dashboardApi.getDailySales())
  )
  ipcMain.handle(
    'db:dashboard-getRecentPurchases',
    protectedHandler('dashboard:read-all', () => dashboardApi.getRecentPurchases())
  )
  ipcMain.handle(
    'db:dashboard-getRecentRepairs',
    protectedHandler('dashboard:read-all', () => dashboardApi.getRecentRepairs())
  )

  // Profile management is a special case - users can manage their own profile
  ipcMain.handle('db:staff-updateProfile', async (event, data) => {
    const user = getUserFromEvent(event)
    if (!user || user.id !== data.id) throw new Error('Unauthorized: You can only update your own profile.')
    
    await staffApi.updateProfile(data)
    const updatedUser = await staffApi.getById(data.id)
    if (!updatedUser) throw new Error('Failed to retrieve updated profile')
    
    userSessions.set(BrowserWindow.fromWebContents(event.sender)!.id, updatedUser) // Update session
    return updatedUser
  })

  ipcMain.handle('db:staff-changePassword', async (event, { id, oldPassword, newPassword }) => {
    const user = getUserFromEvent(event)
    if (!user || user.id !== id) throw new Error('Unauthorized: You can only change your own password.')
    
    const isOldPasswordValid = await staffApi.verifyPassword(user.email, oldPassword)
    if (!isOldPasswordValid) throw new Error('Current password is incorrect')
    
    await staffApi.updatePassword(id, newPassword)
    return { success: true, message: 'Password updated successfully' }
  })

  // Export handler
  ipcMain.handle('db:export-clientReport', protectedHandler('clients:export-history', async (options) => {
    // The export logic is complex, so we wrap the whole thing.
    // The original code is kept as is, just inside the protected handler.
    const { clientId, clientName, purchaseIds = [], repairIds = [] } = options
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (!mainWindow) throw new Error('Main window not found')

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Client Report',
      defaultPath: `Report-${clientName.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    })
    if (!filePath) return { success: false, message: 'Export cancelled by user.' }

    return new Promise((resolve, reject) => {
      // ... (The entire PDF generation logic from your original file goes here)
      // For brevity, I am not pasting all 100+ lines of PDF code, but you should
      // ensure it is placed here inside this Promise.
      // The provided code snippet from your file is correct.
    })
  }))

  console.log('✅ All IPC handlers registered successfully with security wrappers.')
}


// --- THE REST OF THE FILE REMAINS THE SAME ---

/**
 * Create the main Electron window
 */
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
      contextIsolation: true
    }
  });

  // [SECURITY] Clear the session when a window is closed to prevent memory leaks
  mainWindow.on('closed', () => {
    userSessions.delete(mainWindow.id)
  })

  mainWindow.on('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(details => {
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
  registerIpcHandlers();
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});