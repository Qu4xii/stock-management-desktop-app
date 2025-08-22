// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import fs from 'fs';
import { clientsApi, productsApi, purchasesApi, staffApi, repairsApi, historyApi, dashboardApi, exportApi} from './lib/db';
import path from "path";
import * as PDFKit from 'pdfkit';
const PDFDocument = require('pdfkit-table');



function registerIpcHandlers(): void {
  // =========================
  // CLIENTS IPC HANDLERS
  // =========================
  ipcMain.handle('db:clients-getAll', async () => {
    try {
      return await clientsApi.getAll();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get all clients:', error);
      throw error;
    }
  });

  ipcMain.handle('db:clients-add', async (_event, data) => {
    try {
      const record = await clientsApi.add(data);
      return await clientsApi.getById(record.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to add client:', error);
      throw error;
    }
  });

  ipcMain.handle('db:clients-update', async (_event, data) => {
    try {
      await clientsApi.update(data);
      return await clientsApi.getById(data.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to update client:', error);
      throw error;
    }
  });

  ipcMain.handle('db:clients-delete', async (_event, id) => {
    try {
      return await clientsApi.delete(id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to delete client:', error);
      throw error;
    }
  });

  // =========================
  // PRODUCTS IPC HANDLERS
  // =========================
  ipcMain.handle('db:products-getAll', async () => {
    try {
      return await productsApi.getAll();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get all products:', error);
      throw error;
    }
  });

  ipcMain.handle('db:products-add', async (_event, data) => {
    try {
      const record = await productsApi.add(data);
      return await productsApi.getById(record.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to add product:', error);
      throw error;
    }
  });

  ipcMain.handle('db:products-update', async (_event, data) => {
    try {
      await productsApi.update(data);
      return await productsApi.getById(data.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to update product:', error);
      throw error;
    }
  });

  ipcMain.handle('db:products-delete', async (_event, id) => {
    try {
      return await productsApi.delete(id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to delete product:', error);
      throw error;
    }
  });

  // =========================
  // STAFF IPC HANDLERS
  // =========================
  ipcMain.handle('db:staff-getAll', async () => {
    try {
      return await staffApi.getAll();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get all staff:', error);
      throw error;
    }
  });

  ipcMain.handle('db:staff-add', async (_event, data) => {
    try {
      return await staffApi.add(data);
    } catch (error: unknown) {
      console.error('DATABASE ERROR - Failed to add staff:', error);
      if (error instanceof Error && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`A staff member with the email "${data.email}" already exists.`);
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to add staff member';
      throw new Error(errorMessage);
    }
  });


  ipcMain.handle('db:staff-delete', async (_event, id) => {
    try {
      return await staffApi.delete(id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to delete staff:', error);
      throw error;
    }
  });

  // =========================
  // AUTHENTICATION IPC HANDLERS
  // =========================
  ipcMain.handle('db:auth-signUp', async (_event, data) => {
    try {
      console.log('🔐 Processing sign up request for:', data.email);
      const record = await staffApi.signUp(data);
      const user = await staffApi.getById(record.id);
      if (!user) {
        throw new Error('Failed to retrieve user after sign up');
      }
      console.log('✅ Sign up successful for user:', user.email);
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      console.error('❌ DATABASE ERROR - Failed to sign up:', error);
      throw new Error(errorMessage);
    }
  });

  ipcMain.handle('db:auth-logIn', async (_event, { email, password }) => {
    try {
      console.log('🔐 Processing login request for:', email);
      const user = await staffApi.authenticate(email, password);
      if (!user) {
        throw new Error('Authentication failed - invalid credentials');
      }
      console.log('✅ Login successful for user:', user.email);
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ DATABASE ERROR - Failed to log in:', error);
      throw new Error(errorMessage);
    }
  });

  // =========================
  // PURCHASES IPC HANDLERS
  // =========================
  ipcMain.handle('db:purchases-create', async (_event, { clientId, items }) => {
    try {
      return await purchasesApi.create(clientId, items);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to create purchase:', error);
      throw error;
    }
  });

  ipcMain.handle('db:purchases-getForClient', async (_event, clientId) => {
    try {
      return await purchasesApi.getForClient(clientId);
    } catch (error) {
      console.error(`DATABASE ERROR - Failed to get purchases for client ${clientId}:`, error);
      throw error;
    }
  });

  // =========================
  // REPAIRS IPC HANDLERS
  // =========================
  ipcMain.handle('db:repairs-getAll', async () => {
    try {
      return await repairsApi.getAll();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get all repairs:', error);
      throw error;
    }
  });

  ipcMain.handle('db:repairs-getForClient', async (_event, clientId) => {
    try {
      return await repairsApi.getForClient(clientId);
    } catch (error) {
      console.error(`DATABASE ERROR - Failed to get repairs for client ${clientId}:`, error);
      throw error;
    }
  });

  ipcMain.handle('db:repairs-add', async (_event, data) => {
    try {
      const record = await repairsApi.add(data);
      return await repairsApi.getById(record.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to add repair:', error);
      throw error;
    }
  });

  ipcMain.handle('db:repairs-update', async (_event, data) => {
    try {
      await repairsApi.update(data);
      return await repairsApi.getById(data.id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to update repair:', error);
      throw error;
    }
  });

  ipcMain.handle('db:repairs-delete', async (_event, id) => {
    try {
      return await repairsApi.delete(id);
    } catch (error) {
      console.error('DATABASE ERROR - Failed to delete repair:', error);
      throw error;
    }
  });

  // =========================
  // HISTORY IPC HANDLER
  // =========================
  ipcMain.handle('db:history-get', async () => {
    try {
      return await historyApi.get();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get combined history:', error);
      throw error;
    }
  });

  // =========================
  // DASHBOARD IPC HANDLERS
  // =========================
  ipcMain.handle('db:dashboard-getStats', async () => {
    try {
      return await dashboardApi.getStats();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get dashboard stats:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getWorkOrdersByStatus', async () => {
    try {
      return await dashboardApi.getWorkOrdersByStatus();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get work orders by status:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getWorkOrdersByPriority', async () => {
    try {
      return await dashboardApi.getWorkOrdersByPriority();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get work orders by priority:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getDailySales', async () => {
    try {
      return await dashboardApi.getDailySales();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get daily sales:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getRecentPurchases', async () => {
    try {
      return await dashboardApi.getRecentPurchases();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get recent purchases:', error);
      throw error;
    }
  });

  ipcMain.handle('db:dashboard-getRecentRepairs', async () => {
    try {
      return await dashboardApi.getRecentRepairs();
    } catch (error) {
      console.error('DATABASE ERROR - Failed to get recent repairs:', error);
      throw error;
    }
  });
// =========================
// PROFILE MANAGEMENT IPC HANDLERS
// =========================
ipcMain.handle('db:staff-updateProfile', async (_event, data) => {
  try {
    console.log('🔐 Processing profile update for user ID:', data.id);
    
    await staffApi.updateProfile(data);
    
    const updatedUser = await staffApi.getById(data.id);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user profile');
    }
    console.log('✅ Profile update successful for user:', updatedUser.email);
    return updatedUser;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
    console.error('❌ DATABASE ERROR - Failed to update profile:', error);
    throw new Error(errorMessage);
  }
});

ipcMain.handle('db:staff-changePassword', async (_event, { id, oldPassword, newPassword }) => {
  try {
    console.log('🔐 Processing password change for user ID:', id);
    
    // First, get the current user to verify old password
    const user = await staffApi.getById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify the old password
    const isOldPasswordValid = await staffApi.verifyPassword(user.email, oldPassword);
    if (!isOldPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update the password
    await staffApi.updatePassword(id, newPassword);
    
    console.log('✅ Password change successful for user:', user.email);
    return { success: true, message: 'Password updated successfully' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Password change failed';
    console.error('❌ DATABASE ERROR - Failed to change password:', error);
    throw new Error(errorMessage);
  }
});
  // =========================
  // EXPORT CLIENT REPORT HANDLER
  // =========================
  ipcMain.handle('db:export-clientReport', async (_event, options) => {
    try {
      const { clientId, clientName, purchaseIds = [], repairIds = [] } = options;

      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (!mainWindow) throw new Error('Main window not found');

      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Client Report',
        defaultPath: `Report-${clientName.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`,
        filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
      });

      if (!filePath) {
        return { success: false, message: 'Export cancelled by user.' };
      }

      return new Promise((resolve, reject) => {
        try {
          const purchases = purchaseIds.length ? exportApi.getPurchasesByIds(clientId, purchaseIds) : [];
          const repairs = repairIds.length ? exportApi.getRepairsByIds(clientId, repairIds) : [];
          
          console.log('📄 Data for PDF - Purchases:', purchases);
          console.log('📄 Data for PDF - Repairs:', repairs);
          console.log('📄 Repair count:', repairs?.length || 0);
          console.log('📄 Sample repair object:', repairs?.[0] || 'No repairs');
          console.log('📄 Repair object keys:', repairs?.[0] ? Object.keys(repairs[0]) : 'No keys');

          // Cast to any to avoid TypeScript issues with pdfkit-table
          const doc = new PDFDocument({ margin: 30, size: 'A4' }) as any;
          const stream = fs.createWriteStream(filePath);
          doc.pipe(stream);

          stream.on('finish', () => {
            console.log('✅ PDF generation completed successfully');
            resolve({ success: true, message: `Saved to ${filePath}` });
          });
          
          stream.on('error', (err: Error) => {
            console.error('❌ Stream error:', err);
            reject({ success: false, message: err.message });
          });

          // --- PDF CONTENT ---
          doc.fontSize(20).text(`Activity Report for ${clientName}`, { align: 'center' });
          doc.moveDown(2);

          // Add generation date
          doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
          doc.moveDown(1);

          let hasContent = false;

          if (purchases && purchases.length > 0) {
            hasContent = true;
            doc.fontSize(16).fillColor('black').text('Purchase History', { underline: true });
            doc.moveDown(0.5);
            
            const purchaseTableData = {
              title: "Purchase Details",
              headers: [
                { label: "Date", property: "date", width: 100 },
                { label: "Products", property: "products", width: 250 },
                { label: "Total", property: "total", width: 100 }
              ],
              datas: purchases.map((p) => ({
                date: new Date(p.purchase_date).toLocaleDateString(),
                products: p.products || 'N/A',
                total: `$${(p.total_price || 0).toFixed(2)}`
              }))
            };

            try {
              doc.table(purchaseTableData, {
                width: 450,
                columnsSize: [100, 250, 100],
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
                prepareRow: () => doc.font("Helvetica").fontSize(9)
              });
            } catch (tableError) {
              console.error('❌ Error creating purchase table:', tableError);
              doc.fontSize(10);
              purchases.forEach((p, index) => {
                doc.text(`${index + 1}. Date: ${new Date(p.purchase_date).toLocaleDateString()}`);
                doc.text(`   Products: ${p.products || 'N/A'}`);
                doc.text(`   Total: $${(p.total_price || 0).toFixed(2)}`);
                doc.moveDown(0.3);
              });
            }
            
            doc.moveDown(1);
          }

          if (repairs && repairs.length > 0) {
            hasContent = true;
            doc.fontSize(16).fillColor('black').text('Repair History', { underline: true });
            doc.moveDown(0.5);

            // Debug: Log the structure of repair data
            console.log('🔧 Processing repairs for PDF:', repairs.length);
            console.log('🔧 First repair structure:', repairs[0]);

            const repairTableData = {
              title: "Repair Details",
              headers: [
                { label: "Date", property: "date", width: 100 },
                { label: "Description", property: "description", width: 200 },
                { label: "Status", property: "status", width: 80 },
                { label: "Bill", property: "bill", width: 70 }
              ],
              datas: repairs.map((r, index) => {
                // Try multiple possible field names for repairs
                const date = r.requestDate || r.request_date || r.createdAt || r.created_at || r.date;
                const description = r.description || r.problem || r.issue || r.details || 'No description';
                const status = r.status || r.repair_status || r.state || 'Unknown';
                const totalPrice = r.totalPrice || r.total_price || r.bill || r.cost || r.amount;

                console.log(`🔧 Processing repair ${index + 1}:`, {
                  originalData: r,
                  mappedData: { date, description, status, totalPrice }
                });

                return {
                  date: date ? new Date(date).toLocaleDateString() : 'N/A',
                  description: description.toString().substring(0, 50) + (description.toString().length > 50 ? '...' : ''),
                  status: status.toString(),
                  bill: totalPrice ? `$${parseFloat(totalPrice).toFixed(2)}` : 'N/A'
                };
              })
            };

            console.log('🔧 Final repair table data:', repairTableData);

            try {
              doc.table(repairTableData, {
                width: 450,
                columnsSize: [100, 200, 80, 70],
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
                prepareRow: () => doc.font("Helvetica").fontSize(9)
              });
            } catch (tableError) {
              console.error('❌ Error creating repair table:', tableError);
              doc.fontSize(10);
              repairs.forEach((r, index) => {
                const date = r.requestDate || r.request_date || r.createdAt || r.created_at || r.date;
                const description = r.description || r.problem || r.issue || r.details || 'No description';
                const status = r.status || r.repair_status || r.state || 'Unknown';
                const totalPrice = r.totalPrice || r.total_price || r.bill || r.cost || r.amount;

                doc.text(`${index + 1}. Date: ${date ? new Date(date).toLocaleDateString() : 'N/A'}`);
                doc.text(`   Description: ${description}`);
                doc.text(`   Status: ${status}`);
                doc.text(`   Bill: ${totalPrice ? `$${parseFloat(totalPrice).toFixed(2)}` : 'N/A'}`);
                doc.moveDown(0.3);
              });
            }
          }

          if (!hasContent) {
            doc.fontSize(14).text('No data available for the selected items.', { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(10).text('Please ensure you have selected purchases or repairs to include in the report.', { align: 'center' });
          }

          // Add footer
          doc.fontSize(8).fillColor('gray').text(
            `Report generated by your application on ${new Date().toLocaleString()}`,
            30,
            doc.page.height - 50,
            { align: 'center' }
          );

          doc.end();

        } catch (error: unknown) {
          console.error('❌ Error in PDF generation:', error);
          const errorMessage = error instanceof Error ? error.message : 'PDF generation failed';
          reject({ success: false, message: `PDF generation failed: ${errorMessage}` });
        }
      });

    } catch (err: unknown) {
      console.error('❌ Error in export handler:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, message: errorMessage };
    }
  });

  console.log('✅ All IPC handlers registered successfully');
}

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

  mainWindow.on('ready-to-show', () => mainWindow.show());

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load dev URL or production index.html
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

/**
 * App ready
 */
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  // Register all IPC handlers FIRST
  registerIpcHandlers();

  // Watch window shortcuts in dev
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Create the main application window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});