// In src/preload/index.ts

import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// --- 1. CLEANED UP IMPORTS ---
// We import all necessary types from our central types file using a reliable relative path.
import { Client, Product, Purchase, StaffMember, DBApi } from '../renderer/src/types';

// --- 2. APPLY THE DBApi INTERFACE ---
// By adding ': DBApi', we are telling TypeScript that this object MUST
// perfectly match the shape we defined in our types file. This will give us
// excellent error checking and autocompletion.
const dbApi: DBApi = {
  // --- CLIENT METHODS (with full types) ---
  getClients: () => ipcRenderer.invoke('db:clients-getAll'),
  addClient: (clientData: Omit<Client, 'id' | 'picture'>) => ipcRenderer.invoke('db:clients-add', clientData),
  updateClient: (clientData: Client) => ipcRenderer.invoke('db:clients-update', clientData),
  deleteClient: (clientId: number) => ipcRenderer.invoke('db:clients-delete', clientId),

  // --- PRODUCT METHODS (with full types) ---
  getProducts: () => ipcRenderer.invoke('db:products-getAll'),
  addProduct: (productData: Omit<Product, 'id'>) => ipcRenderer.invoke('db:products-add', productData),
  updateProduct: (productData: Product) => ipcRenderer.invoke('db:products-update', productData),
  deleteProduct: (productId: number) => ipcRenderer.invoke('db:products-delete', productId),

  // --- STAFF METHODS (with full types) ---
  getStaff: () => ipcRenderer.invoke('db:staff-getAll'),
  addStaff: (staffData: Omit<StaffMember, 'id' | 'picture'>) => ipcRenderer.invoke('db:staff-add', staffData),
  updateStaff: (staffData: StaffMember) => ipcRenderer.invoke('db:staff-update', staffData),
  deleteStaff: (staffId: number) => ipcRenderer.invoke('db:staff-delete', staffId),
  
  // --- PURCHASE METHODS (with full types) ---
  // Note: The types for createPurchase need to be defined in your types/index.ts
  // For now, I'll use a clear placeholder.
  createPurchase: (data: { clientId: number; items: { id: number; quantity: number }[] }) => 
    ipcRenderer.invoke('db:purchases-create', data),
  getPurchasesForClient: (clientId: number) => 
    ipcRenderer.invoke('db:purchases-getForClient', clientId),

  getRepairs: () => ipcRenderer.invoke('db:repairs-getAll'),
  addRepair: (data) => ipcRenderer.invoke('db:repairs-add', data),
  updateRepair: (data) => ipcRenderer.invoke('db:repairs-update', data),
  deleteRepair: (id) => ipcRenderer.invoke('db:repairs-delete', id),
  getRepairsForClient: (clientId: number) => ipcRenderer.invoke('db:repairs-getForClient', clientId),
  getHistory: () => ipcRenderer.invoke('db:history-get'),
  getDashboardStats: () => ipcRenderer.invoke('db:dashboard-getStats'),
};

// --- SECURELY EXPOSE THE APIS ---
// This part of the code remains the same.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('db', dbApi);
  } catch (error) {
    console.error('Failed to expose APIs in preload script:', error);
  }
} else {
  // Fallback for older configurations
  // @ts-ignore (reason: unsafe)
  window.electron = electronAPI;
  // @ts-ignore (reason: unsafe)
  window.db = dbApi;
}