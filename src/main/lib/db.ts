// In src/main/lib/db.ts

import path from 'path'
import { app } from 'electron'
import Database from 'better-sqlite3'
import { StaffMember, Repair, Client, Product } from '../../renderer/src/types'; // Import all necessary types

// --- DATABASE SETUP ---

// Define the path for the database file.
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
  // Use a transaction for initial setup to ensure all tables are created together.
  db.transaction(() => {
    // SQL for the 'clients' table
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        idCard TEXT UNIQUE NOT NULL,
        address TEXT,
        email TEXT,
        phone TEXT,
        picture TEXT
      );
    `);
    
    // SQL for the 'products' table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        price REAL NOT NULL
      );
    `);
    
    // SQL for the 'staff' table
    db.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        isAvailable INTEGER NOT NULL DEFAULT 1, -- 1 for true, 0 for false
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        picture TEXT
      );
    `);

    // SQL for the 'repairs' table
    db.exec(`
      CREATE TABLE IF NOT EXISTS repairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Not Started',
        priority TEXT NOT NULL DEFAULT 'Medium',
        requestDate TEXT NOT NULL,
        dueDate TEXT,
        totalPrice REAL,
        clientId INTEGER NOT NULL,
        staffId INTEGER,
        FOREIGN KEY (clientId) REFERENCES clients (id) ON DELETE CASCADE,
        FOREIGN KEY (staffId) REFERENCES staff (id) ON DELETE SET NULL
      );
    `);
    
    // SQL for the 'purchases' table
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        purchase_date TEXT NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
      );
    `);
    
    // SQL for the 'purchase_items' join table
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id INTEGER NOT NULL,
        product_id INTEGER,
        quantity_purchased INTEGER NOT NULL,
        price_at_purchase REAL NOT NULL,
        FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
      );
    `);
  })();
}

// Run the table creation function immediately.
createTables()

// --- CLIENTS API ---
export const clientsApi = {
  getAll: (): Client[] => {
    return db.prepare('SELECT * FROM clients ORDER BY name ASC').all() as Client[];
  },
  add: (clientData: Omit<Client, 'id' | 'picture'>): { id: number } => {
    const info = db.prepare('INSERT INTO clients (name, idCard, address, email, phone) VALUES (@name, @idCard, @address, @email, @phone)').run(clientData);
    return { id: Number(info.lastInsertRowid) };
  },
  getById: (id: number): Client => {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client;
  },
  update: (clientData: Client): void => {
    db.prepare('UPDATE clients SET name = @name, idCard = @idCard, address = @address, email = @email, phone = @phone WHERE id = @id').run(clientData);
  },
  delete: (id: number): void => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  },
};

// --- PRODUCTS API ---
export const productsApi = {
  getAll: (): Product[] => {
    return db.prepare('SELECT * FROM products ORDER BY name ASC').all() as Product[];
  },
  add: (productData: Omit<Product, 'id'>): { id: number } => {
    const info = db.prepare('INSERT INTO products (name, quantity, price) VALUES (@name, @quantity, @price)').run(productData);
    return { id: Number(info.lastInsertRowid) };
  },
  getById: (id: number): Product => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product;
  },
  update: (productData: Product): void => {
    db.prepare('UPDATE products SET name = @name, quantity = @quantity, price = @price WHERE id = @id').run(productData);
  },
  delete: (id: number): void => {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
  },
};

// --- STAFF API ---
export const staffApi = {
  getAll: (): StaffMember[] => {
    const staffMembers = db.prepare('SELECT * FROM staff ORDER BY name ASC').all() as any[];
    return staffMembers.map(member => ({ ...member, isAvailable: member.isAvailable === 1 }));
  },
  add: (staffData: Omit<StaffMember, 'id' | 'picture'>): { id: number } => {
    const info = db.prepare('INSERT INTO staff (name, role, isAvailable, email, phone) VALUES (@name, @role, @isAvailable, @email, @phone)').run({ ...staffData, isAvailable: staffData.isAvailable ? 1 : 0 });
    return { id: Number(info.lastInsertRowid) };
  },
  getById: (id: number): StaffMember => {
    const member = db.prepare('SELECT * FROM staff WHERE id = ?').get(id) as any;
    return { ...member, isAvailable: member.isAvailable === 1 };
  },
  update: (staffData: StaffMember): void => {
    db.prepare('UPDATE staff SET name = @name, role = @role, isAvailable = @isAvailable, email = @email, phone = @phone WHERE id = @id').run({ ...staffData, isAvailable: staffData.isAvailable ? 1 : 0 });
  },
  delete: (id: number): void => {
    db.prepare('DELETE FROM staff WHERE id = ?').run(id);
  },
};

// --- REPAIRS API (CORRECTED & ADDED) ---
export const repairsApi = {
  // READ: Get all repairs, joining with clients and staff to get their names
  getAll: (): Repair[] => {
    const query = `
      SELECT
        r.id,
        r.description,
        r.status,
        r.priority,
        r.requestDate,
        r.dueDate,
        r.totalPrice,
        r.clientId,
        r.staffId,
        c.name AS clientName,
        c.address AS clientLocation,
        s.name AS staffName
      FROM repairs r
      JOIN clients c ON r.clientId = c.id
      LEFT JOIN staff s ON r.staffId = s.id
      ORDER BY r.requestDate DESC
    `;
    return db.prepare(query).all() as Repair[];
  },

  // READ: Get all repairs for a specific client ID.
  getForClient: (clientId: number): Repair[] => {
    const query = `
      SELECT
        r.id, r.description, r.status, r.priority, r.requestDate, r.dueDate, r.totalPrice,
        r.clientId, r.staffId, s.name AS staffName
      FROM repairs r
      LEFT JOIN staff s ON r.staffId = s.id
      WHERE r.clientId = ?
      ORDER BY r.requestDate DESC
    `;
    // We pass the clientId as a parameter to the query.
    return db.prepare(query).all(clientId) as Repair[];
  },
  
  // Helper to get a single repair by ID with joined data
  getById: (id: number | bigint): Repair => {
    const query = `
      SELECT
        r.id, r.description, r.status, r.priority, r.requestDate, r.dueDate, r.totalPrice,
        r.clientId, r.staffId, c.name AS clientName, c.address AS clientLocation, s.name AS staffName
      FROM repairs r
      JOIN clients c ON r.clientId = c.id
      LEFT JOIN staff s ON r.staffId = s.id
      WHERE r.id = ?
    `;
    return db.prepare(query).get(id) as Repair;
  },

  // CREATE: Add a new repair
  add: (data: Omit<Repair, 'id' | 'clientName' | 'staffName' | 'clientLocation'>): { id: number } => {
    const stmt = db.prepare(
      'INSERT INTO repairs (description, status, priority, requestDate, dueDate, totalPrice, clientId, staffId) VALUES (@description, @status, @priority, @requestDate, @dueDate, @totalPrice, @clientId, @staffId)'
    );
    const info = stmt.run(data);
    return { id: Number(info.lastInsertRowid) };
  },
  
  // UPDATE: Update an existing repair
  update: (data: Repair): void => {
    const stmt = db.prepare(
      'UPDATE repairs SET description = @description, status = @status, priority = @priority, dueDate = @dueDate, totalPrice = @totalPrice, clientId = @clientId, staffId = @staffId WHERE id = @id'
    );
    stmt.run(data);
  },

  // DELETE: Remove a repair
  delete: (id: number): void => {
    db.prepare('DELETE FROM repairs WHERE id = ?').run(id);
  },
};

// --- PURCHASES API ---
export const purchasesApi = {
  getForClient: (clientId: number): any[] => {
    const stmt = db.prepare(`
      SELECT 
        p.id, p.purchase_date, p.total_price,
        GROUP_CONCAT(prod.name || ' (x' || pi.quantity_purchased || ')', '; ') as products
      FROM purchases p
      JOIN purchase_items pi ON p.id = pi.purchase_id
      LEFT JOIN products prod ON pi.product_id = prod.id
      WHERE p.client_id = ?
      GROUP BY p.id
      ORDER BY p.purchase_date DESC
    `);
    return stmt.all(clientId);
  },
  create: (clientId: number, items: { id: number; quantity: number }[]): { id: number } => {
    const transaction = db.transaction(() => {
      let totalPrice = 0;
      const itemsWithPrice = items.map(item => {
        const product = productsApi.getById(item.id);
        if (!product || product.quantity < item.quantity) {
          throw new Error(`Not enough stock for "${product?.name || `ID ${item.id}`}". Available: ${product?.quantity || 0}, Requested: ${item.quantity}.`);
        }
        totalPrice += product.price * item.quantity;
        return { ...item, price_at_purchase: product.price };
      });
      
      const purchaseInfo = db.prepare('INSERT INTO purchases (client_id, purchase_date, total_price) VALUES (?, ?, ?)').run(clientId, new Date().toISOString(), totalPrice);
      const purchaseId = purchaseInfo.lastInsertRowid;

      const itemStmt = db.prepare('INSERT INTO purchase_items (purchase_id, product_id, quantity_purchased, price_at_purchase) VALUES (?, ?, ?, ?)');
      const updateStockStmt = db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?');

      for (const item of itemsWithPrice) {
        itemStmt.run(purchaseId, item.id, item.quantity, item.price_at_purchase);
        updateStockStmt.run(item.quantity, item.id);
      }
      return { id: Number(purchaseId) };
    });
    return transaction();
  }
};

//history api
export const historyApi = {
  get: (): any[] => {
    const query = `
      -- First, select all the relevant data from the repairs table
      SELECT
        'repair' as type,
        r.id,
        r.requestDate as eventDate,
        c.name as clientName,
        r.description as primaryDetail,
        s.name as secondaryDetail, -- This will be the staff name
        r.totalPrice
      FROM repairs r
      JOIN clients c ON r.clientId = c.id
      LEFT JOIN staff s ON r.staffId = s.id

      UNION ALL -- This command combines the results of the two queries

      -- Second, select data from purchases, formatting it to match the columns above
      SELECT
        'purchase' as type,
        p.id,
        p.purchase_date as eventDate,
        c.name as clientName,
        -- We group the purchased items into a single string for the detail view
        GROUP_CONCAT(pi.quantity_purchased || 'x ' || prod.name, '; ') as primaryDetail,
        NULL as secondaryDetail, -- Purchases don't have a secondary detail like an assigned staff member
        p.total_price as totalPrice
      FROM purchases p
      JOIN clients c ON p.client_id = c.id
      JOIN purchase_items pi ON p.id = pi.purchase_id
      LEFT JOIN products prod ON pi.product_id = prod.id
      GROUP BY p.id

      -- Finally, order the combined results by date, with the newest first
      ORDER BY eventDate DESC;
    `;
    return db.prepare(query).all();
  }
};

// --- DASHBOARD API ---
export const dashboardApi = {
  getStats: (): any => {
    // Each query uses 'as' to name the result column for easy access.
 const totalClients = (db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number }).count;
    const totalStaff = (db.prepare('SELECT COUNT(*) as count FROM staff').get() as { count: number }).count;
    
    // For SUM queries, the result might be null, so we handle that after the type assertion.
    const totalSales = (db.prepare('SELECT SUM(total_price) as total FROM purchases').get() as { total: number | null }).total || 0;
    const totalRepairs = (db.prepare('SELECT COUNT(*) as count FROM repairs').get() as { count: number }).count;
    const stockValue = (db.prepare('SELECT SUM(quantity * price) as total FROM products').get() as { total: number | null }).total || 0;
    const outOfStockCount = (db.prepare('SELECT COUNT(*) as count FROM products WHERE quantity = 0').get() as { count: number }).count;
    
    // Calculate the ratio safely, avoiding division by zero.
    const stockToSalesRatio = totalSales > 0 ? stockValue / totalSales : 0;

    return {
      totalClients,
      totalStaff,
      totalSales,
      totalRepairs,
      stockValue,
      outOfStockCount,
      stockToSalesRatio,
    };
  },

  // Gets the count of work orders for each status.
  getWorkOrdersByStatus: (): any[] => {
    const query = `
      SELECT status as name, COUNT(*) as value
      FROM repairs
      GROUP BY status;
    `;
    return db.prepare(query).all();
  },

  // Gets the count of work orders for each priority.
  getWorkOrdersByPriority: (): any[] => {
    const query = `
      SELECT priority as name, COUNT(*) as value
      FROM repairs
      GROUP BY priority;
    `;
    return db.prepare(query).all();
  },

  // Gets the total sales amount for each of the last 7 days.
  getDailySales: (): any[] => {
    const query = `
      SELECT
        -- Extracts the date part (YYYY-MM-DD) from the full ISO string
        SUBSTR(purchase_date, 1, 10) as date,
        SUM(total_price) as totalSales
      FROM purchases
      -- Filters for records from the last 7 days
      WHERE purchase_date >= date('now', '-7 days')
      GROUP BY date
      ORDER BY date ASC;
    `;
    return db.prepare(query).all();
  },

  getRecentPurchases: (): any[] => {
    const query = `
      SELECT
        p.id,
        p.purchase_date,
        p.total_price,
        c.name as clientName,
        GROUP_CONCAT(pi.quantity_purchased || 'x ' || prod.name, '; ') as products
      FROM purchases p
      JOIN clients c ON p.client_id = c.id
      JOIN purchase_items pi ON p.id = pi.purchase_id
      LEFT JOIN products prod ON pi.product_id = prod.id
      GROUP BY p.id
      ORDER BY p.purchase_date DESC
      LIMIT 5;
    `;
    return db.prepare(query).all();
  },

  // Gets the 5 most recent repairs with client and staff names.
  getRecentRepairs: (): any[] => {
    const query = `
      SELECT
        r.id,
        r.requestDate,
        r.status,
        r.description,
        c.name AS clientName
      FROM repairs r
      JOIN clients c ON r.clientId = c.id
      ORDER BY r.requestDate DESC
      LIMIT 5;
    `;
    return db.prepare(query).all();
  }

};