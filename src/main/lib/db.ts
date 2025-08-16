// In src/main/lib/db.ts

import path from 'path'
import { app } from 'electron'
import Database from 'better-sqlite3'

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