// File: src/main/index.ts

import { app, shell, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
//import path from 'path'
//import * as PDFKit from 'pdfkit'
import {
  clientsApi,
  productsApi,
  purchasesApi,
  staffApi,
  repairsApi,
  historyApi,
  dashboardApi,
  exportApi,
  suppliersApi,
  purchaseOrdersApi
} from './lib/db'
import { StaffMember } from '../renderer/src/types' // [SECURITY] Import StaffMember for session typing
import { hasPermission } from './lib/permissions' // [SECURITY] Import our permission checker
console.log('Cache folder is located at:', app.getPath('userData'))
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}
const PDFDocument = require('pdfkit-table')

// [SECURITY] Step 1: User Session Management
// This Map will store the authenticated user for each application window.
// Key: window.id (number), Value: StaffMember object
const userSessions = new Map<number, StaffMember>()
console.log('Resolved icon path:', icon);
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
      // --- [THE FIX] ---
      // 1. Check if any users already exist in the database.
      const totalStaff = await staffApi.getTotalStaffCount();

      let userRole = 'Not Assigned';
      // 2. If the database is empty, this is the very first user. Make them a Manager.
      if (totalStaff === 0) {
        userRole = 'Manager';
        console.log('[AUTH] First user detected. Promoting to Manager.');
      }

      // 3. Call the modified signUp function, passing the determined role.
      const record = await staffApi.signUp(data, userRole);
      // --- [END OF FIX] ---

      const user = await staffApi.getById(record.id);
      if (!user) throw new Error('Failed to retrieve user after sign up');

      // [SECURITY] Associate the new user with the window that signed up
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) userSessions.set(window.id, user);

      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      throw new Error(errorMessage);
    }
  });

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
ipcMain.handle('db:products-getAll', protectedHandler('products:read', async () => {
    try {
      // --- [DEBUG] Log that the handler was invoked ---
      console.log('[IPC] Handling getProducts-getAll request...');
      
      const products = await productsApi.getAll();
      
      // --- [DEBUG] Log the result from the database ---
      console.log(`[IPC] Found ${products.length} products in the database.`);
      
      return products;
    } catch (error) {
      console.error('[IPC Error] getProducts-getAll failed:', error);
      throw error; // Propagate the error to the frontend
    }
  }))

ipcMain.handle('db:products-add', protectedHandler('products:create', (data) => {
      // Create a clean, explicit object to pass to the database
      const productData = {
        name: data.name,
        quantity: data.quantity, // Should be 0 based on frontend logic
        price: data.price,
        supplierId: data.supplierId,
        costPrice: data.costPrice,
        sku: data.sku,
      };
      const record = productsApi.add(productData);
      return productsApi.getById(record.id);
    })
  )

  // --- ALSO MODIFY THIS HANDLER ---
ipcMain.handle('db:products-update', protectedHandler('products:update', (data) => {
      // The 'data' object from the frontend is already a complete Product object.
      // We can pass it directly to the API.
      // The .run() method in db.ts will only use the properties it needs.
      productsApi.update(data); 
      return productsApi.getById(data.id);
    })
  )

  ipcMain.handle('db:products-adjustStock', protectedHandler('products:update', (data) => productsApi.adjustStock(data)));
  ipcMain.handle('db:po-receive', protectedHandler('products:update', (id) => purchaseOrdersApi.receive(id)));

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
    // New handler to get only Technicians for assignment dropdowns
    ipcMain.handle('db:staff-getTechnicians', protectedHandler('repairs:create', () => staffApi.getTechnicians()));
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
  // [SECURITY] New handler to get repairs for a client but only those assigned to the logged-in technician
  ipcMain.handle('db:repairs-getForClientByStaff', async (event, clientId) => {
    try {
      // 1. Securely get the logged-in user from their window session.
      const user = getUserFromEvent(event)
      if (!user) {
        throw new Error('Authentication Required.')
      }

      // 2. We don't need a permission check here because we are explicitly
      //    checking the role and using the user's own ID for the query.
      if (user.role !== 'Technician') {
         // If a non-technician somehow calls this, we can fall back to the general function.
         // Or throw an error, but this is safer.
        return repairsApi.getForClient(clientId);
      }

      // 3. Call the database function using the clientId from the frontend
      //    AND the user.id from the secure session. This prevents a technician
      //    from ever seeing another technician's work.
      console.log(`[IPC] Fetching repairs for client ${clientId} by staff ${user.id}`);
      return repairsApi.getForClientByStaff(clientId, user.id)

    } catch (error) {
      console.error('[IPC Error] getForClientByStaff failed:', error);
      throw error; // Re-throw the error so the frontend can catch it and display a toast.
    }
  })
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
// ===================================================================
  // --- TECHNICIAN-SPECIFIC DASHBOARD HANDLERS ---
  // Ensure this entire block exists in your file.
  // ===================================================================

  // This handler securely gets the stats for the logged-in user.
  ipcMain.handle('db:dashboard-getTechnicianStats', async (event) => {
    const user = getUserFromEvent(event);
    if (!user) throw new Error('Authentication Required.');
    if (!hasPermission(user.role, 'dashboard:read-limited')) throw new Error('Unauthorized');
    
    // It uses the user's ID from the secure session, not from the frontend.
    return dashboardApi.getTechnicianStats(user.id);
  });

  // This handler gets the status breakdown for the logged-in user.
  ipcMain.handle('db:dashboard-getTechnicianWorkOrdersByStatus', async (event) => {
    const user = getUserFromEvent(event);
    if (!user) throw new Error('Authentication Required.');
    if (!hasPermission(user.role, 'dashboard:read-limited')) throw new Error('Unauthorized');

    return dashboardApi.getTechnicianWorkOrdersByStatus(user.id);
  });

  // This handler gets the active repair list for the logged-in user.
  ipcMain.handle('db:dashboard-getActiveRepairsForStaff', async (event) => {
    const user = getUserFromEvent(event);
    if (!user) throw new Error('Authentication Required.');
    if (!hasPermission(user.role, 'dashboard:read-limited')) throw new Error('Unauthorized');
    
    return dashboardApi.getActiveRepairsForStaff(user.id);
  });

  // ===================================================================
  // --- INVENTORY-SPECIFIC DASHBOARD HANDLERS ---
  // ===================================================================
  
  ipcMain.handle(
    'db:dashboard-getInventoryStats',
    protectedHandler('dashboard:read-limited', () => dashboardApi.getInventoryStats())
  );

  ipcMain.handle(
    'db:dashboard-getLowStockProducts',
    protectedHandler('dashboard:read-limited', () => dashboardApi.getLowStockProducts())
  );
  
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
  // ===================================================================
  // --- SUPPLIERS IPC HANDLERS ---
  // ===================================================================
  ipcMain.handle('db:suppliers-getAll', protectedHandler('products:read', () => suppliersApi.getAll()));
  
  // CORRECTED: The handler now correctly expects 'data' as its first and only argument.
  ipcMain.handle('db:suppliers-add', protectedHandler('products:create', async (data) => {
    // The previous fix of creating a clean object is still a good practice.
    const supplierData = {
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
    };
    
    const record = await suppliersApi.add(supplierData);
    return suppliersApi.getById(record.id);
  }));

  // CORRECTED: The 'update' handler is also fixed to expect 'data' as its first argument.
  ipcMain.handle('db:suppliers-update', protectedHandler('products:update', async (data) => {
    const supplierData = {
      id: data.id,
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
    };
    
    await suppliersApi.update(supplierData);
    return suppliersApi.getById(data.id);
  }));
  // ===================================================================
  // --- PURCHASE ORDERS IPC HANDLERS ---
  // ===================================================================
  ipcMain.handle('db:po-getAll', protectedHandler('products:read', () => purchaseOrdersApi.getAll()));
  
  ipcMain.handle('db:po-getById', protectedHandler('products:read', (id) => purchaseOrdersApi.getById(id)));

  ipcMain.handle('db:po-create', protectedHandler('products:create', (data) => purchaseOrdersApi.create(data)));
  // delete supplier with PO check
  // CORRECTED: The 'delete' handler is fixed to expect 'id' as its first argument.
  ipcMain.handle('db:suppliers-delete', protectedHandler('products:delete', (id) => {
    // 1. Check for associated purchase orders first.
    const poCount = suppliersApi.getPurchaseOrderCount(id);

    // 2. If there are associated POs, throw a user-friendly error.
    if (poCount > 0) {
      throw new Error(`Cannot delete this supplier. They are associated with ${poCount} purchase order(s). Please reassign or delete those orders first.`);
    }

    // 3. If the check passes, proceed with the deletion.
    return suppliersApi.delete(id);
  }));


// =========================
// EXPORT CLIENT REPORT HANDLER (FIXED VERSION)
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

          // Add table with error handling
          try {
            doc.table(purchaseTableData, {
              width: 450,
              columnsSize: [100, 250, 100],
              prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
              prepareRow: () => doc.font("Helvetica").fontSize(9)
            });
          } catch (tableError: unknown) {
            console.error('❌ Error creating purchase table:', getErrorMessage(tableError));
            // Fallback to simple text if table fails
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
                bill: totalPrice ? `${parseFloat(totalPrice).toFixed(2)}` : 'N/A'
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
          } catch (tableError: unknown) {
            console.error('❌ Error creating repair table:', getErrorMessage(tableError));
            // Fallback to simple text if table fails
            doc.fontSize(10);
            repairs.forEach((r, index) => {
              const date = r.requestDate || r.request_date || r.createdAt || r.created_at || r.date;
              const description = r.description || r.problem || r.issue || r.details || 'No description';
              const status = r.status || r.repair_status || r.state || 'Unknown';
              const totalPrice = r.totalPrice || r.total_price || r.bill || r.cost || r.amount;

              doc.text(`${index + 1}. Date: ${date ? new Date(date).toLocaleDateString() : 'N/A'}`);
              doc.text(`   Description: ${description}`);
              doc.text(`   Status: ${status}`);
              doc.text(`   Bill: ${totalPrice ? `${parseFloat(totalPrice).toFixed(2)}` : 'N/A'}`);
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
        reject({ success: false, message: `PDF generation failed: ${getErrorMessage(error)}` });
      }
    });

  } catch (err: unknown) {
    console.error('❌ Error in export handler:', err);
    return { success: false, message: getErrorMessage(err) };
  }
});

  console.log('✅ All IPC handlers registered successfully with security wrappers.')
}

// --- THE REST OF THE FILE REMAINS THE SAME ---

/**
 * Create the main Electron window
 */
function createWindow(): void {
  const iconPath = join(__dirname, '../../resources/icon.png');
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    
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
  console.log('User Data Path:', app.getPath('userData'));
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