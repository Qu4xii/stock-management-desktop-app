// In src/renderer/src/components/ClientsTable.tsx

import React from 'react';
import { Client } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// --- THIS IS THE INTERFACE THAT NEEDS TO BE FIXED ---
interface ClientsTableProps {
  clients: Client[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: number) => void;
  onNewPurchase: (client: Client) => void; // <-- FIX #1: Add the missing prop definition
}

const getInitials = (name: string): string => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name[0] ? name[0].toUpperCase() : '';
};

// --- THIS IS THE FUNCTION SIGNATURE THAT NEEDS TO BE FIXED ---
// We need to add 'onNewPurchase' to the list of props we are receiving.
function ClientsTable({ clients, onView, onEdit, onDelete, onNewPurchase }: ClientsTableProps): JSX.Element {
  return (
    <Card>
      <Table>
        <TableHeader>
          {/* ... TableHeader content remains the same ... */}
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name & Email</TableHead>
            <TableHead>ID Card & Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No clients found.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                {/* ... TableCell for Avatar, Name, ID Card ... */}
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
                <TableCell>
                  <div>{client.idCard}</div>
                  <div className="text-sm text-muted-foreground">{client.phone}</div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(client)}>
                        View Details
                      </DropdownMenuItem>
                      {/* --- THIS IS THE NEW MENU ITEM --- */}
                      <DropdownMenuItem onClick={() => onNewPurchase(client)}>
                        New Purchase
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(client)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${client.name}"?`)) {
                            onDelete(client.id);
                          }
                        }}
                        className="text-red-500 focus:text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

export default ClientsTable;

