// In src/renderer/src/types/index.ts

export interface Client {
  id: number;
  name: string;
  idCard: string;
  address: string;  // <-- NEW FIELD
  email: string;      // <-- NEW FIELD
  phone: string;      // <-- NEW FIELD
  picture?: string;   // <-- NEW, OPTIONAL FIELD (the '?' makes it optional)
}
export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  // 'availability' can be derived from quantity > 0, but we can add it if needed.
}

// Define the shape of our new database API
export interface DBApi {
  getClients: () => Promise<Client[]>;
  addClient: (clientData: Omit<Client, 'id' | 'picture'>) => Promise<Client>;
  updateClient: (clientData: Client) => Promise<Client>;
  deleteClient: (clientId: number) => Promise<void>;
   getProducts: () => Promise<Product[]>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (productData: Product) => Promise<Product>;
  deleteProduct: (productId: number) => Promise<void>;
}


// Extend the global Window interface to include our new 'db' property
declare global {
  interface Window {
    db: DBApi;
  }
  
    // --- ADD THE NEW PRODUCT METHODS ---

}