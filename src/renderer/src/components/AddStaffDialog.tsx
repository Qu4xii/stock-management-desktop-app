// In src/renderer/src/components/AddStaffDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  // --- 2. ADD BACK THE STATE FOR isAvailable ---
  const [isAvailable, setIsAvailable] = useState(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !email || !password) {
      alert('Please provide a name, email, and an initial password.');
      return;
    }

    // --- 3. PASS isAvailable IN THE SUBMITTED DATA ---
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
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Fill in the details for the new team member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
          <div><label>Full Name</label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label>Email Address</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label>Phone Number</label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label>Role</label><Select value={role} onValueChange={(value: StaffRole) => setRole(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
          <div><label>Initial Password</label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>

          {/* --- 4. ADD THE AVAILABILITY DROPDOWN BACK --- */}
          <div>
            <label>Availability</label>
            <Select
              value={isAvailable ? 'available' : 'busy'}
              onValueChange={(value) => setIsAvailable(value === 'available')}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
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