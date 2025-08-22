// File: src/renderer/src/components/ClientsTable.tsx

import React from 'react'
import { Client } from '../types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MoreHorizontal, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
// [PERMISSIONS] Step 1: Import the permissions hook
import { usePermissions } from '../hooks/usePermissions'

interface ClientsTableProps {
  clients: Client[]
  onView: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (clientId: number) => void
  onNewPurchase: (client: Client) => void
}

const getInitials = (name: string): string => {
  const names = name.split(' ')
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return name[0] ? name[0].toUpperCase() : ''
}

function ClientsTable({
  clients,
  onView,
  onEdit,
  onDelete,
  onNewPurchase
}: ClientsTableProps): JSX.Element {
  // [PERMISSIONS] Step 2: Get the 'can' function from the hook
  const { can } = usePermissions()

  // [PERMISSIONS] Step 3: Determine if any actions are possible to decide if we should even show the column.
  // The 'View Details' action is always available if they can read clients, so we mainly check for other actions.
  const canPerformAnyAction =
    can('clients:update') || can('clients:delete') || can('clients:create-purchase')

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name & Email</TableHead>
            <TableHead>ID Card</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No clients found.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={client.picture} alt={client.name} />
                    <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div>{client.name}</div>
                  <div className="text-sm text-muted-foreground">{client.email}</div>
                </TableCell>
                <TableCell>{client.idCard}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.phone}</TableCell>
                <TableCell className="text-right">
                  {/* [PERMISSIONS] Step 4: Conditionally render the actions */}
                  <div className="flex items-center justify-end gap-2">
                    {/* Show "New Purchase" button only if user has permission */}
                    {can('clients:create-purchase') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNewPurchase(client)}
                        className="h-8"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Purchase
                      </Button>
                    )}

                    {/* The dropdown menu is now also conditional */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {/* View is always available for anyone who can see the table */}
                        <DropdownMenuItem onClick={() => onView(client)}>
                          View Details
                        </DropdownMenuItem>

                        {/* Show "Edit" only if user has permission */}
                        {can('clients:update') && (
                          <DropdownMenuItem onClick={() => onEdit(client)}>Edit</DropdownMenuItem>
                        )}

                        {/* Show "Delete" only if user has permission */}
                        {can('clients:delete') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (
                                  window.confirm(`Are you sure you want to delete "${client.name}"?`)
                                ) {
                                  onDelete(client.id)
                                }
                              }}
                              className="text-red-500 focus:text-red-500"
                            >
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

export default ClientsTable