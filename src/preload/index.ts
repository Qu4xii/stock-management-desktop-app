// The preload process plays a middleware role in bridging
// the call from the front end, and the function in the main process



// In src/preload/index.ts

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload' // Keep this from the boilerplate
// In src/preload/index.ts

// This path means:
// '../'  -> Go up from 'preload' to 'src'
// 'renderer/' -> Go down into 'renderer'
// 'src/' -> Go down into 'src'
// 'types' -> Go down into 'types'
import { Client, DBApi } from '../renderer/src/types/index';
import {  Product,} from '../renderer/src/types'; 
// --- OUR CUSTOM DATABASE API ---
const dbApi = {
  // READ: Get all clients
  getClients: (): Promise<Client[]> => ipcRenderer.invoke('db:clients-getAll'),

  // CREATE: Add a new client
  addClient: (clientData: Omit<Client, 'id' | 'picture'>): Promise<Client> => 
    ipcRenderer.invoke('db:clients-add', clientData),
  
  // UPDATE: Update an existing client
  updateClient: (clientData: Client): Promise<Client> => 
    ipcRenderer.invoke('db:clients-update', clientData),

  // DELETE: Remove a client
  deleteClient: (clientId: number): Promise<void> => 
    ipcRenderer.invoke('db:clients-delete', clientId),

  // We will add product functions here later
    getProducts: () => ipcRenderer.invoke('db:products-getAll'),
  addProduct: (productData) => ipcRenderer.invoke('db:products-add', productData),
  updateProduct: (productData) => ipcRenderer.invoke('db:products-update', productData),
  deleteProduct: (productId) => ipcRenderer.invoke('db:products-delete', productId),
}


// Use `contextBridge` to securely expose APIs to the renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // Expose our custom database API on the window object as 'window.db'
    contextBridge.exposeInMainWorld('db', dbApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // Fallback for non-context-isolated environments (less secure, from boilerplate)
  // @ts-ignore (reason: unsafe)
  window.electron = electronAPI
  // @ts-ignore (reason: unsafe)
  window.db = dbApi
}

