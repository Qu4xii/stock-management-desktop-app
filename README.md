# Invento - Stock and Repair Tracker - Desktop Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Required Node.JS >= 18.0.0](https://img.shields.io/static/v1?label=node&message=%20%3E=18.0.0&logo=node.js&color=3f893e)](https://nodejs.org/en/download/package-manager)

## Overview

Invento is a comprehensive, cross-platform desktop application designed to manage inventory, client repairs, and staff roles for a small to medium-sized service or retail business. Built with a secure, modern technology stack, it provides a robust solution for tracking the entire lifecycle of products and work orders.

The application's architecture is centered on a sophisticated, backend-enforced role-based access control system, ensuring that staff members can only see and interact with the data and features relevant to their specific job function.

<!-- Add a GIF or a screenshot of the application dashboard here for a great first impression! -->
<!-- ![Invento Dashboard](link-to-your-screenshot.png) -->

### Core Features

*   **Secure Role-Based Access Control (RBAC):** Five pre-configured roles (Manager, Technician, Inventory Associate, Cashier, Not Assigned) with granular, backend-enforced permissions. The UI dynamically adapts to hide or show features based on the logged-in user's role.
*   **Integrated Inventory Management:** Full product lifecycle tracking. Product quantities are not edited manually; they are automatically and safely updated through a formal procurement system to maintain data integrity.
*   **Repair & Work Order Tracking:** A complete system for creating, assigning, and managing the status of client repair jobs from creation to completion. Technicians can only view and manage work orders assigned to them.
*   **Supplier & Purchase Order System:** A full procurement workflow to manage suppliers and create purchase orders. Stock levels are automatically increased across the application when an order is marked as "Received" in a secure, transactional database operation.
*   **Client & Staff Management:** Centralized modules for managing customer information and employee data, including role assignments for staff which are controlled exclusively by Managers.
*   **Role-Specific Dashboards:** Dynamic dashboard views tailored to each role, providing managers with high-level business KPIs, technicians with their personal workload and stats, and inventory associates with stock-level alerts.

### Tech Stack

| Category               | Technology                                                                     |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Software Framework** | [Electron](https://www.electronjs.org/) (v32+)                                 |
| **Frontend Library**   | [React](https://react.dev/) (v18+) with [TypeScript](https://www.typescriptlang.org/) |
| **Database**           | [SQLite](https://www.sqlite.org/index.html) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **Build Tool**         | [Vite](https://vite.dev/) with [Electron-Vite](https://electron-vite.org/)     |
| **UI and Styling**     | [shadcn/ui](https://ui.shadcn.com/) with [Tailwind CSS](https://tailwindcss.com/) |

## Development Setup

To set up the project for development, clone the repository and install the dependencies.

```bash
# Clone this project
git clone <your-repository-url-here>

# Navigate to the project folder
cd invento-project

# Install all dependencies
npm install

# IMPORTANT: Rebuild native modules for Electron
npm run rebuild

# Start the project in development mode
npm run dev
### Test and build commands

# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux

├── build/                          # Icons and resources for the packaged application
├── dist/                           # Output folder for the final installer
├── out/                            # Intermediate build output
├── resources/                      # Application icon for development
├── src/                            # Main source code
│   ├── main/                       # Main process code (Node.js Backend)
│   │   ├── lib/                    # Core backend libraries
│   │   │   ├── db.ts               # --- All SQLite database queries and API modules
│   │   │   └── permissions.ts      # --- Defines the Role-Based Access Control matrix
│   │   └── index.ts                # --- Entry point for the main process and all IPC handlers
│   ├── preload/                    # Preload scripts (Secure Bridge)
│   │   └── index.ts                # --- Exposes secure backend functions to the frontend
│   ├── renderer/                   # Renderer process code (React Frontend)
│   │   ├── src/
│   │   │   ├── components/         # Reusable React components
│   │   │   ├── context/            # --- React Contexts (e.g., AuthContext)
│   │   │   ├── hooks/              # --- Custom hooks (e.g., usePermissions)
│   │   │   ├── pages/              # --- Main page components for each feature
│   │   │   └── ...
│   │   ├── main.tsx                # --- Entry point for the React application
├── package.json                    # Project metadata, scripts, and dependencies
└── README.md                       # This file