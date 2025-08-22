// In src/renderer/src/components/AddStaffDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label'; // Import Label component
import { StaffMember, StaffRole } from '../types';

interface AddStaffDialogProps {
  children: React.ReactNode; // This will be the "+ New Technician" button
  onStaffAdded: (staffData: Omit<StaffMember, 'id' | 'picture'> & { password: string }) => void;
}

const roles: StaffRole[] = ['Technician', 'Inventory Associate', 'Cashier', 'Manager'];

function AddStaffDialog({ children, onStaffAdded }: AddStaffDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Technician');
  const [password, setPassword] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !email || !password) {
      alert('Please provide a name, email, and an initial password.');
      return;
    }

    onStaffAdded({ name, email, phone, role, password, isAvailable });
    
    // Close the dialog and reset the form
    setIsOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setRole('Technician');
    setPassword('');
    setIsAvailable(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* Remove hardcoded background - let ShadCN theming handle it */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Fill in the details for the new team member.
          </DialogDescription>
        </DialogHeader>
        {/* Use proper Label components with consistent spacing */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="staff-name">Full Name</Label>
            <Input 
              id="staff-name"
              type="text"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="staff-role">Role</Label>
            <Select value={role} onValueChange={(value: StaffRole) => setRole(value)}>
              <SelectTrigger id="staff-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email Address</Label>
            <Input 
              id="staff-email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="staff-phone">Phone Number</Label>
            <Input 
              id="staff-phone"
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="staff-password">Initial Password</Label>
            <Input 
              id="staff-password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-availability">Availability</Label>
            <Select
              value={isAvailable ? 'available' : 'busy'}
              onValueChange={(value) => setIsAvailable(value === 'available')}
            >
              <SelectTrigger id="staff-availability">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full mt-4 col-span-full">
            Add Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddStaffDialog;