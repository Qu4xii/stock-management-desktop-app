// File: src/renderer/src/components/StaffTable.tsx

import { StaffMember, StaffRole } from '../types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MoreHorizontal } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
// [PERMISSIONS] Step 1: Import the permissions hook
import { usePermissions } from '../hooks/usePermissions'

interface StaffTableProps {
  staff: StaffMember[]
  onEdit: (staffMember: StaffMember) => void
  onDelete: (staffMemberId: number) => void
  onUpdate: (updatedStaffMember: StaffMember) => void
}

const allRoles: StaffRole[] = ['Technician', 'Inventory Associate', 'Cashier', 'Manager', 'Not Assigned']

const getInitials = (name: string = ''): string => {
  if (!name) return ''
  const names = name.split(' ')
  const firstInitial = names[0] ? names[0][0] : ''
  const lastInitial = names.length > 1 ? names[names.length - 1][0] : ''
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

function StaffTable({ staff, onEdit, onDelete, onUpdate }: StaffTableProps): JSX.Element {
  // [PERMISSIONS] Step 2: Get the 'can' function and the current user's info
  const { can, currentUser } = usePermissions()

  // [PERMISSIONS] Step 3: Determine if the main actions column should even be visible
  const canPerformAnyAction = can('staff:update') || can('staff:delete')

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Worker Name</TableHead>
            <TableHead className="w-[200px]">Role</TableHead>
            <TableHead className="w-[150px]">Availability</TableHead>
            <TableHead>Contact</TableHead>
            {canPerformAnyAction && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canPerformAnyAction ? 5 : 4}
                className="h-24 text-center text-muted-foreground"
              >
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium flex items-center">
                  <Avatar className="mr-3">
                    <AvatarImage src={member.picture} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  {member.name}
                </TableCell>

                {/* --- Secured Interactive Role Dropdown --- */}
                <TableCell>
                  <Select
                    value={member.role}
                    onValueChange={(newRole: StaffRole) => {
                      onUpdate({ ...member, role: newRole })
                    }}
                    // [PERMISSIONS] Disable if user can't update staff OR if they try to edit themselves
                    disabled={!can('staff:update') || member.id === currentUser?.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allRoles.map((r) => (
                        <SelectItem
                          key={r}
                          value={r}
                          // [PERMISSIONS] Prevent non-managers from creating other managers
                          disabled={r === 'Manager' && currentUser?.role !== 'Manager'}
                        >
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* --- Secured Interactive Availability Dropdown --- */}
                <TableCell>
                  <Select
                    value={member.isAvailable ? 'available' : 'busy'}
                    onValueChange={(newAvailability) => {
                      onUpdate({ ...member, isAvailable: newAvailability === 'available' })
                    }}
                    // [PERMISSIONS] Can only be changed by someone with update permission
                    disabled={!can('staff:update')}
                  >
                    <SelectTrigger
                      className={member.isAvailable ? 'border-green-500' : 'border-red-500'}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  <a href={`mailto:${member.email}`} className="text-blue-500 hover:underline">
                    {member.email}
                  </a>
                  <div className="text-sm text-muted-foreground">{member.phone}</div>
                </TableCell>

                {/* --- Secured Actions Column --- */}
                {canPerformAnyAction && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {/* Edit Full Details is a general update action */}
                        {can('staff:update') && (
                          <DropdownMenuItem onClick={() => onEdit(member)}>
                            Edit Full Details
                          </DropdownMenuItem>
                        )}
                        {/* Delete is a separate, more destructive action */}
                        {can('staff:delete') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${member.name}"?`)) {
                                  onDelete(member.id)
                                }
                              }}
                              className="text-red-500 focus:text-red-500"
                              // [PERMISSIONS] Prevent a user from deleting themselves
                              disabled={member.id === currentUser?.id}
                            >
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

export default StaffTable