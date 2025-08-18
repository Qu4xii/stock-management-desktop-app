// In src/main/lib/db.ts

import path from 'path'
import { app } from 'electron'
import Database from 'better-sqlite3'
import { StaffMember } from '../../renderer/src/types';
// --- DATABASE SETUP ---

// Define the path for the database file.
// app.getPath('userData') is the standard, safe place to store app data.
const dbPath = path.join(app.getPath('userData'), 'stockapp.db')

// Initialize the database connection.
const db = new Database(dbPath)

// Improve performance and prevent locking issues.
db.pragma('journal_mode = WAL')

// --- TABLE CREATION ---
/**
 * This function runs SQL commands to create our database tables
 * if they haven't been created already.
 */
const createTables = (): void => {
  // SQL for the 'clients' table, matching our Client type.
  const createClientsTable = `
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      idCard TEXT UNIQUE NOT NULL,
      address TEXT,
      email TEXT,
      phone TEXT,
      picture TEXT
    );
  `
  // SQL for the 'products' table.
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      price REAL NOT NULL
    );
  `
  // We can add more tables here later (repairs, purchases, etc.)

   // This table stores the main record of a transaction.
  const createPurchasesTable = `
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      purchase_date TEXT NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    );
  `;

  // This is a "join table". It stores each individual item within a purchase.
  const createPurchaseItemsTable = `
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity_purchased INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL, -- Store the price in case the product's main price changes later
      FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
    );
  `;


  const createStaffTable = `
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      isAvailable INTEGER NOT NULL DEFAULT 1, -- 1 for true (Available), 0 for false (Busy)
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      picture TEXT
    );
  `;

  db.exec(createStaffTable);
  db.exec(createPurchasesTable);
  db.exec(createPurchaseItemsTable);

  // Execute the SQL commands.
  db.exec(createClientsTable)
  db.exec(createProductsTable)
}

// Run the table creation function immediately.
createTables()

// --- CLIENTS API ---
// A collection of functions for interacting with the 'clients' table.

export const clientsApi = {
  // READ: Get all clients
  getAll: (): any[] => {
    const stmt = db.prepare('SELECT * FROM clients ORDER BY name ASC')
    return stmt.all()
  },

  // CREATE: Add a new client
  add: (clientData: any): { id: number } => {
    const stmt = db.prepare(
      'INSERT INTO clients (name, idCard, address, email, phone) VALUES (@name, @idCard, @address, @email, @phone)'
    )
    const info = stmt.run(clientData)
    return { id: Number(info.lastInsertRowid) }
  },
  
  // A helper to get a single client by ID
  getById: (id: number): any => {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id)
  },
  
  // UPDATE: Update an existing client
  update: (clientData: any): void => {
    const stmt = db.prepare(
      'UPDATE clients SET name = @name, idCard = @idCard, address = @address, email = @email, phone = @phone WHERE id = @id'
    )
    stmt.run(clientData)
  },

  // DELETE: Remove a client
  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM clients WHERE id = ?')
    stmt.run(id)
  },
}

// We will add a productsApi object here next.
// In src/main/lib/db.ts

// ... (your existing db setup and clientsApi object) ...

// --- ADD THE PRODUCTS API OBJECT BELOW ---

export const productsApi = {
  // READ: Get all products
  getAll: (): any[] => {
    const stmt = db.prepare('SELECT * FROM products ORDER BY name ASC');
    return stmt.all();
  },

  // CREATE: Add a new product
  add: (productData: any): { id: number } => {
    const stmt = db.prepare(
      'INSERT INTO products (name, quantity, price) VALUES (@name, @quantity, @price)'
    );
    const info = stmt.run(productData);
    return { id: Number(info.lastInsertRowid) };
  },
  
  // Helper to get a single product by ID
  getById: (id: number): any => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },
  
  // UPDATE: Update an existing product
  update: (productData: any): void => {
    const stmt = db.prepare(
      'UPDATE products SET name = @name, quantity = @quantity, price = @price WHERE id = @id'
    );
    stmt.run(productData);
  },

  // DELETE: Remove a product
  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
  },
};



export const purchasesApi = {
  // READ: Get all purchases for a specific client
  getForClient: (clientId: number): any[] => {
    const stmt = db.prepare(`
      SELECT 
        p.id, 
        p.purchase_date, 
        p.total_price,
        GROUP_CONCAT(prod.name, ', ') as products
      FROM purchases p
      JOIN purchase_items pi ON p.id = pi.purchase_id
      JOIN products prod ON pi.product_id = prod.id
      WHERE p.client_id = ?
      GROUP BY p.id
      ORDER BY p.purchase_date DESC
    `);
    return stmt.all(clientId);
  },

  
  // CREATE: A new purchase (this is the complex transaction)
  create: (clientId: number, items: { id: number; quantity: number }[]): { id: number } => {
    // Use a transaction to ensure all or no database changes are made.
    const transaction = db.transaction(() => {
      let totalPrice = 0;

      // First, get the current price for each product and calculate the total.
      const itemsWithPrice = items.map(item => {
        const product = productsApi.getById(item.id);
        if (!product || product.quantity < item.quantity) {
          throw new Error(`Not enough stock for product ID ${item.id}.`);
        }
        totalPrice += product.price * item.quantity;
        return { ...item, price_at_purchase: product.price };
      });
      
      // 1. Create the main purchase record
      const purchaseStmt = db.prepare(
        'INSERT INTO purchases (client_id, purchase_date, total_price) VALUES (?, ?, ?)'
      );
      const purchaseInfo = purchaseStmt.run(clientId, new Date().toISOString(), totalPrice);
      const purchaseId = purchaseInfo.lastInsertRowid;

      // 2. Create a record for each item in the purchase
      const itemStmt = db.prepare(
        'INSERT INTO purchase_items (purchase_id, product_id, quantity_purchased, price_at_purchase) VALUES (?, ?, ?, ?)'
      );
      const updateStockStmt = db.prepare(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?'
      );

      for (const item of itemsWithPrice) {
        // 2a. Insert the purchase item line
        itemStmt.run(purchaseId, item.id, item.quantity, item.price_at_purchase);
        // 2b. Update the product's stock quantity
        updateStockStmt.run(item.quantity, item.id);
      }

      return { id: Number(purchaseId) };
    });

    return transaction();
  }

  
};

// In src/main/lib/db.ts

// ... (imports and other Api objects) ...

export const staffApi = {
  // READ: Get all staff members
  getAll: (): StaffMember[] => {
    const stmt = db.prepare('SELECT * FROM staff ORDER BY name ASC');
    // We cast the raw database result to 'any[]' to bypass the strict type check for the conversion.
    const staffMembers = stmt.all() as any[];

    return staffMembers.map(member => ({
      ...member,
      // Now TypeScript allows the comparison because 'member' is treated as 'any'.
      isAvailable: member.isAvailable === 1
    }));
  },

  // CREATE: Add a new staff member
  add: (staffData: Omit<StaffMember, 'id' | 'picture'>): { id: number } => {
    const stmt = db.prepare(
      'INSERT INTO staff (name, role, isAvailable, email, phone) VALUES (@name, @role, @isAvailable, @email, @phone)'
    );
    const info = stmt.run(staffData);
    // FIX #2: Correct the typo from 'lastInsertRowid' to 'lastInsertRowid'
    return { id: Number(info.lastInsertRowid) };
  },
  
  // A helper to get a single staff member by ID
  getById: (id: number): StaffMember => {
    // Cast the raw database result to 'any' for the conversion.
    const member = db.prepare('SELECT * FROM staff WHERE id = ?').get(id) as any;
    
    // Return the correctly typed StaffMember object with the boolean converted.
    return {
      ...member,
      isAvailable: member.isAvailable === 1
    };
  },
  
  // UPDATE: Update an existing staff member
  update: (staffData: StaffMember): void => {
    const stmt = db.prepare(
      'UPDATE staff SET name = @name, role = @role, isAvailable = @isAvailable, email = @email, phone = @phone WHERE id = @id'
    );
    stmt.run(staffData);
  },

  // DELETE: Remove a staff member
  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM staff WHERE id = ?');
    stmt.run(id);
  },
};
