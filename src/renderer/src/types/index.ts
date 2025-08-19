// In src/renderer/src/types/index.ts

// --- Data Structure Definitions ---

export interface Client {
  id: number;
  name: string;
  idCard: string;
  address: string;
  email: string;
  phone: string;
  picture?: string;
}

export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

// Defines the specific roles a staff member can have.
export type StaffRole = 'Technician' | 'Inventory Associate' | 'Cashier' | 'Manager';

export interface StaffMember {
  id: number;
  name: string;
  role: StaffRole;
  isAvailable: boolean; // Frontend expects a boolean
  email: string;
  phone: string;
  picture?: string;
}

// Defines the structure of a purchase record, especially for display purposes.
export interface Purchase {
  id: number;
  purchase_date: string;
  total_price: number;
  products: string; // A comma-separated string of product names, as returned by our DB query.
}

export type HistoryEventType = 'purchase' | 'repair';

export interface HistoryEvent {
  type: HistoryEventType;
  id: number;
  eventDate: string; // The date of the purchase or repair request
  clientName: string;
  primaryDetail: string; // The description for a repair, or the list of items for a purchase
  secondaryDetail: string | null; // The assigned staff member for a repair
  totalPrice: number | null;
}

// --- API and Global Window Definitions ---

/**
 * This is the master interface for our entire backend API.
 * The preload script must implement this, and the frontend will use it for type-safe calls.
 */
export interface DBApi {
  // Client Methods
  getClients: () => Promise<Client[]>;
  addClient: (clientData: Omit<Client, 'id' | 'picture'>) => Promise<Client>;
  updateClient: (clientData: Client) => Promise<Client>;
  deleteClient: (clientId: number) => Promise<void>;

  // Product Methods
  getProducts: () => Promise<Product[]>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (productData: Product) => Promise<Product>;
  deleteProduct: (productId: number) => Promise<void>;
  
  // Staff Methods
  getStaff: () => Promise<StaffMember[]>;
  addStaff: (staffData: Omit<StaffMember, 'id' | 'picture'>) => Promise<StaffMember>;
  updateStaff: (staffData: StaffMember) => Promise<StaffMember>;
  deleteStaff: (staffId: number) => Promise<void>;

  // Purchase Methods
  createPurchase: (data: { clientId: number; items: { id: number; quantity: number }[] }) => Promise<{ id: number }>;
  getPurchasesForClient: (clientId: number) => Promise<Purchase[]>;

  // Repair Methods
  getRepairsForClient: (clientId: number) => Promise<Repair[]>;
  getRepairs: () => Promise<Repair[]>;
  addRepair: (repairData: Omit<Repair, 'id' | 'clientName' | 'staffName' | 'clientLocation'>) => Promise<Repair>;
  updateRepair: (repairData: Repair) => Promise<Repair>;
  deleteRepair: (repairId: number) => Promise<void>;

   // --- ADD THE NEW HISTORY METHOD ---
  getHistory: () => Promise<HistoryEvent[]>;

  // --- ADD THE NEW DASHBOARD METHOD ---
  getDashboardStats: () => Promise<DashboardStats>;

}

export type RepairStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
export type RepairPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Repair {
  id: number;
  description: string;
  status: RepairStatus;
  priority: RepairPriority;
  requestDate: string; // ISO date string (e.g., "2024-08-15T12:00:00.000Z")
  dueDate: string;     // ISO date string
  totalPrice?: number
  // These are foreign keys that link to other tables
  clientId: number;
staffId: number | null;
  // These fields will be 'joined' in our database query for display purposes
  clientName?: string;
  clientLocation?: string;
  staffName?: string;
}

// --- 2A. DEFINE THE NEW DashboardStats INTERFACE ---
export interface DashboardStats {
  totalClients: number;
  totalStaff: number;
  totalSales: number;
  totalRepairs: number;
  stockValue: number;
  outOfStockCount: number;
  stockToSalesRatio: number;
}


/**
 * This extends the global 'Window' object type.
 * It tells TypeScript that our renderer process window will have a property
 * named 'db' whose shape is defined by our DBApi interface.
 */
declare global {
  interface Window {
    db: DBApi;
  }
}