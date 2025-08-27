#  Invento - Stock and repair Tracker - Desktop Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Required Node.JS >= 18.0.0](https://img.shields.io/static/v1?label=node&message=%20%3E=18.0.0&logo=node.js&color=3f893e)](https://nodejs.org/en/download/package-manager)

## Overview

StockApp is a comprehensive, cross-platform desktop application designed to manage inventory, client repairs, and staff roles for a small to medium-sized service or retail business. Built with a secure, modern technology stack, it provides a robust solution for tracking the entire lifecycle of products and work orders.

The application features a sophisticated role-based access control system, ensuring that staff members can only see and interact with the data relevant to their specific job function.

### Core Features

*   **Role-Based Access Control (RBAC):** A secure, backend-enforced permission system with five distinct roles (Manager, Technician, Inventory Associate, Cashier, Not Assigned). The UI dynamically adapts to each user's permissions.
*   **Inventory Management:** Full CRUD (Create, Read, Update, Delete) functionality for products. Product quantities are automatically updated through a formal procurement system.
*   **Repair/Work Order Tracking:** A complete system for creating, assigning, and managing the status of client repair jobs from start to finish.
*   **Supplier & Purchase Order System:** A full procurement workflow to manage suppliers and create purchase orders. Stock levels are automatically increased when an order is marked as "Received."
*   **Client & Staff Management:** Centralized modules for managing customer and employee information, including role assignments for staff.
*   **Role-Specific Dashboards:** Dynamic dashboard views tailored to each role, providing managers with high-level business KPIs, technicians with their personal workload, and inventory associates with stock-level alerts.

### Tech Stack

| Category               | Technology                                                                     |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Software Framework** | [Electron](https://www.electronjs.org/)                                        |
| **Frontend Library**   | [React](https://react.dev/)                                                    |
| **Database**           | [SQLite](https://www.sqlite.org/index.html) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **Build Tool**         | [Vite](https://vite.dev/), [Electron-Vite](https://electron-vite.org/)          |
| **UI and Styling**     | [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)   |


## Getting Started

To set up the project for development, clone the repository and install the dependencies.

```bash
# Clone this project
git clone <your-repository-url-here>

# Navigate to the project folder
cd StockApp

# Install dependencies
npm install

# Start the project in development mode
npm run dev

### Test and build commands

# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux

## Project Structure
```
├── resources/                      # Application icon and other static assets
├── src/                            # Main source code
│   ├── main/                       # Main process code (Node.js Backend)
│   │   ├── lib/                    # Core backend libraries
│   │   │   ├── db.ts               # --- All SQLite database queries and API modules
│   │   │   └── permissions.ts      # --- Defines the Role-Based Access Control matrix
│   │   └── index.ts                # --- Entry point for the main process and all IPC handlers
│   ├── preload/                    # Preload scripts (Secure Bridge)
│   │   └── index.ts                # --- Exposes secure backend functions to the frontend via contextBridge
│   ├── renderer/                   # Renderer process code (React Frontend)
│   │   ├── src/                    
│   │   │   ├── components/         # Reusable React components
│   │   │   │   ├── dashboards/     # --- Role-specific dashboard components
│   │   │   │   ├── dialogs/        # --- Add/Edit/View dialog components
│   │   │   │   └── ui/             # --- Shadcn UI components
│   │   │   ├── contexts/           # --- React Contexts (e.g., AuthContext)
│   │   │   ├── hooks/              # --- Custom hooks (e.g., usePermissions)
│   │   │   ├── pages/              # --- Main page components for each feature
│   │   │   ├── types/              # --- All TypeScript type definitions (single source of truth)
│   │   │   └── App.tsx             # --- Main application component with the router
│   │   ├── main.tsx                # --- Entry point for the React application
│   │   └── index.html              # --- HTML template (contains the app title)
├── .gitignore                      # Git ignore patterns
├── components.json                 # Shadcn Components configuration
├── electron.vite.config.ts         # Vite configuration for Electron
├── package.json                    # Project metadata and dependencies
├── README.md                       # This file
└── tsconfig.json                   # Main TypeScript configuration
```