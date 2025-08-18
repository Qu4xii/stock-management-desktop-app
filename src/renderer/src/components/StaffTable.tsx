// In src/renderer/src/components/StaffTable.tsx

import React from 'react';
import { StaffMember, StaffRole } from '../types';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';

// Define the props this component now requires.
interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (staffMember: StaffMember) => void;
  onDelete: (staffMemberId: number) => void;
  onUpdate: (updatedStaffMember: StaffMember) => void; // <-- The new prop for inline edits
}

const roles: StaffRole[] = ['Technician', 'Inventory Associate', 'Cashier', 'Manager'];

const getInitials = (name: string = ''): string => {
  if (!name) return '';
  const names = name.split(' ');
  const firstInitial = names[0] ? names[0][0] : '';
  const lastInitial = names.length > 1 ? names[names.length - 1][0] : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

function StaffTable({ staff, onEdit, onDelete, onUpdate }: StaffTableProps): JSX.Element {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Technician Name</TableHead>
            <TableHead className="w-[200px]">Role</TableHead>
            <TableHead className="w-[150px]">Availability</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
                
                {/* --- Interactive Role Dropdown --- */}
                <TableCell>
                  <Select
                    value={member.role}
                    onValueChange={(newRole: StaffRole) => {
                      onUpdate({ ...member, role: newRole });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* --- Interactive Availability Dropdown --- */}
                <TableCell>
                  <Select
                    value={member.isAvailable ? 'available' : 'busy'}
                    onValueChange={(newAvailability) => {
                      onUpdate({ ...member, isAvailable: newAvailability === 'available' });
                    }}
                  >
                    <SelectTrigger className={member.isAvailable ? 'border-green-500' : 'border-red-500'}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                
                <TableCell>
                  <a href={`mailto:${member.email}`} className="text-blue-500 hover:underline">{member.email}</a>
                  <div className="text-sm text-muted-foreground">{member.phone}</div>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(member)}>Edit Full Details</DropdownMenuItem>
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