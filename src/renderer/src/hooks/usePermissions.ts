// File: src/renderer/src/hooks/usePermissions.ts

import { useAuth } from '../context/AuthContext'
import { StaffRole } from '../types'

/**
 * [IMPORTANT] This matrix MUST be kept in sync with the one in `src/main/lib/permissions.ts`.
 * It defines the permissions for each role on the frontend.
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
 * Custom hook to check user permissions based on their role.
 * This provides a simple way to conditionally render UI elements.
 *
 * @example
 * const { can, role } = usePermissions();
 *
 * if (can('clients:create')) {
 *   return <Button>Add Client</Button>;
 * }
 */
export function usePermissions() {
  const { currentUser } = useAuth()
  const role = currentUser?.role

  /**
   * Checks if the current user has the required permission.
   * @param requiredPermission The permission string to check (e.g., 'clients:delete').
   * @returns `true` if the user has permission, otherwise `false`.
   */
  const can = (requiredPermission: string): boolean => {
    if (!role) {
      return false // No user, no permissions
    }

    const userPermissions = permissions[role]
    if (!userPermissions) {
      return false // Role not found in matrix
    }

    // Check for admin wildcard
    if (userPermissions.includes('*')) {
      return true
    }

    // Check for the specific permission
    return userPermissions.includes(requiredPermission)
  }

  return { can, role, currentUser }
}