// File: src/preload/index.ts

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { DBApi } from '../renderer/src/types' // Using the master type for safety

const dbApi: DBApi = {
  // --- CLIENT METHODS ---
  getClients: () => ipcRenderer.invoke('db:clients-getAll'),
  addClient: (clientData) => ipcRenderer.invoke('db:clients-add', clientData),
  updateClient: (clientData) => ipcRenderer.invoke('db:clients-update', clientData),
  deleteClient: (clientId) => ipcRenderer.invoke('db:clients-delete', clientId),

  // --- PRODUCT METHODS ---
  getProducts: () => ipcRenderer.invoke('db:products-getAll'),
  addProduct: (productData) => ipcRenderer.invoke('db:products-add', productData),
  updateProduct: (productData) => ipcRenderer.invoke('db:products-update', productData),
  adjustStock: (data) => ipcRenderer.invoke('db:products-adjustStock', data),
  deleteProduct: (productId) => ipcRenderer.invoke('db:products-delete', productId),

  // --- STAFF METHODS ---
  getStaff: () => ipcRenderer.invoke('db:staff-getAll'),
  addStaff: (staffData) => ipcRenderer.invoke('db:staff-add', staffData),
  updateStaff: (staffData) => ipcRenderer.invoke('db:staff-update', staffData),
  deleteStaff: (staffId) => ipcRenderer.invoke('db:staff-delete', staffId),

  // --- PROFILE MANAGEMENT METHODS ---
  updateProfile: (data) => ipcRenderer.invoke('db:staff-updateProfile', data),
  changePassword: (data) => ipcRenderer.invoke('db:staff-changePassword', data),

  // --- PURCHASE METHODS ---
  createPurchase: (data) => ipcRenderer.invoke('db:purchases-create', data),
  getPurchasesForClient: (clientId) => ipcRenderer.invoke('db:purchases-getForClient', clientId),

  // --- REPAIR METHODS ---
  getRepairs: () => ipcRenderer.invoke('db:repairs-getAll'),
  addRepair: (data) => ipcRenderer.invoke('db:repairs-add', data),
  updateRepair: (data) => ipcRenderer.invoke('db:repairs-update', data),
  deleteRepair: (id) => ipcRenderer.invoke('db:repairs-delete', id),
  getRepairsForClient: (clientId) => ipcRenderer.invoke('db:repairs-getForClient', clientId),
  getRepairsForClientByStaff: (clientId) => ipcRenderer.invoke('db:repairs-getForClientByStaff', clientId),
  // --- HISTORY & DASHBOARD ---
  getHistory: () => ipcRenderer.invoke('db:history-get'),
  getDashboardStats: () => ipcRenderer.invoke('db:dashboard-getStats'),
  getWorkOrdersByStatus: () => ipcRenderer.invoke('db:dashboard-getWorkOrdersByStatus'),
  getWorkOrdersByPriority: () => ipcRenderer.invoke('db:dashboard-getWorkOrdersByPriority'),
  getDailySales: () => ipcRenderer.invoke('db:dashboard-getDailySales'),
  getRecentPurchases: () => ipcRenderer.invoke('db:dashboard-getRecentPurchases'),
  getRecentRepairs: () => ipcRenderer.invoke('db:dashboard-getRecentRepairs'),
    // ===================================================================
  // --- ADD THESE THREE LINES FOR THE TECHNICIAN DASHBOARD ---
  // ===================================================================
  getTechnicianStats: () => ipcRenderer.invoke('db:dashboard-getTechnicianStats'),
  getTechnicianWorkOrdersByStatus: () => ipcRenderer.invoke('db:dashboard-getTechnicianWorkOrdersByStatus'),
  getActiveRepairsForStaff: () => ipcRenderer.invoke('db:dashboard-getActiveRepairsForStaff'),
  // ===================================================================
  // --- SUPPLIER METHODS ---
  // ===================================================================
  getSuppliers: () => ipcRenderer.invoke('db:suppliers-getAll'),
  addSupplier: (data) => ipcRenderer.invoke('db:suppliers-add', data),
  updateSupplier: (data) => ipcRenderer.invoke('db:suppliers-update', data),
  deleteSupplier: (id) => ipcRenderer.invoke('db:suppliers-delete', id),
  // --- PURCHASE ORDER METHODS ---
  getPurchaseOrders: () => ipcRenderer.invoke('db:po-getAll'),
  getPurchaseOrderById: (id) => ipcRenderer.invoke('db:po-getById', id),
  createPurchaseOrder: (data) => ipcRenderer.invoke('db:po-create', data),
  receivePurchaseOrder: (id) => ipcRenderer.invoke('db:po-receive', id),

  // ===================================================================
  // --- INVENTORY DASHBOARD METHODS ---
  // ===================================================================
  getInventoryStats: () => ipcRenderer.invoke('db:dashboard-getInventoryStats'),
  getLowStockProducts: () => ipcRenderer.invoke('db:dashboard-getLowStockProducts'),
  // --- AUTHENTICATION ---
  signUp: (data) => ipcRenderer.invoke('db:auth-signUp', data),
  logIn: (credentials) => ipcRenderer.invoke('db:auth-logIn', credentials),
  // [SECURITY] ADD THIS LINE TO COMPLETE THE BRIDGE
  logOut: () => ipcRenderer.invoke('auth:logOut'),

exportClientReport: (options: {
  clientId: number;
  clientName: string;
  purchaseIds?: number[];
  repairIds?: number[];
}) => ipcRenderer.invoke('db:export-clientReport', options),
}

// --- SECURELY EXPOSE THE APIS ---
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('db', dbApi)
  } catch (error) {
    console.error('Failed to expose APIs in preload script:', error)
  }
} else {
  // @ts-ignore (unsafe)
  window.electron = electronAPI
  // @ts-ignore (unsafe)
  window.db = dbApi
}