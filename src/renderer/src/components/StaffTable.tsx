// In src/renderer/src/components/StaffTable.tsx

import React from 'react';
import { StaffMember } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from './ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (staffMember: StaffMember) => void;
  onDelete: (staffMemberId: number) => void;
}

// --- THIS IS THE CORRECTED FUNCTION ---
// This version of the function correctly implements the logic and always returns a string.
const getInitials = (name: string = ''): string => {
  if (!name) return ''; // Handle empty or null names gracefully
  const names = name.split(' ');
  // Get the first letter of the first name
  const firstInitial = names[0] ? names[0][0] : '';
  // Get the first letter of the last name (if it exists)
  const lastInitial = names.length > 1 ? names[names.length - 1][0] : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

function StaffTable({ staff, onEdit, onDelete }: StaffTableProps): JSX.Element {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Technician Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    member.isAvailable
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {member.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </TableCell>
                <TableCell>
                  <a href={`mailto:${member.email}`} className="text-blue-500 hover:underline">{member.email}</a>
                </TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(member)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${member.name}"?`)) {
                            onDelete(member.id);
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

export default StaffTable;