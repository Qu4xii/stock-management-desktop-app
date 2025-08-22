// File: src/main/lib/permissions.ts

import type { StaffRole } from '../.././renderer/src/types';

/**
 * Defines the permissions for each role.
 * Format: 'feature:action'
 * Wildcard '*' means full access to all features.
 */
const permissions: Record<StaffRole, string[]> = {
  // Manager has full access to everything.
  Manager: ['*'],

  // Technician has limited, specific access.
  Technician: [
    'clients:read',
    'products:read',
    'staff:read-self',
    'repairs:create',
    'repairs:read-assigned',
    'repairs:update-assigned',
    'dashboard:read-limited'
  ],

  // Inventory Associate manages products.
  'Inventory Associate': [
    'products:create',
    'products:read',
    'products:update',
    'products:delete',
    'dashboard:read-limited'
  ],

  // Cashier is a front-desk role.
  Cashier: [
    'clients:create',
    'clients:read',
    'clients:update',
    'clients:create-purchase',
    'clients:export-history',
    'products:read',
    'staff:read',
    'repairs:create',
    'repairs:read',
    'repairs:update',
    'history:read',
    'dashboard:read-all'
  ],

  // 'Not Assigned' has no permissions at all.
  'Not Assigned': []
}

/**
 * Checks if a given role has the required permission.
 * @param role The role of the user.
 * @param requiredPermission The permission string to check for.
 * @returns True if the user has permission, false otherwise.
 */
export function hasPermission(role: StaffRole, requiredPermission: string): boolean {
  if (!role) return false

  const userPermissions = permissions[role]
  if (!userPermissions) return false

  // Check for admin wildcard
  if (userPermissions.includes('*')) {
    return true
  }

  // Check for the specific permission
  return userPermissions.includes(requiredPermission)
}