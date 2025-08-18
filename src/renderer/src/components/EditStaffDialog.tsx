// In src/renderer/src/components/EditStaffDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { StaffMember, StaffRole } from '../types';

interface EditStaffDialogProps {
  staffMember: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onStaffUpdated: (updatedStaffMember: StaffMember) => void;
}

// This array defines the options for our role dropdown.
const roles: StaffRole[] = ['Technician', 'Inventory Associate', 'Cashier', 'Manager'];

function EditStaffDialog({ staffMember, isOpen, onClose, onStaffUpdated }: EditStaffDialogProps): JSX.Element {
  // Create state for each form field
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Technician');
  const [isAvailable, setIsAvailable] = useState(true);

  // This useEffect hook populates the form with the staff member's
  // data whenever the dialog is opened with a new person.
  useEffect(() => {
    if (staffMember) {
      setName(staffMember.name);
      setEmail(staffMember.email);
      setPhone(staffMember.phone);
      setRole(staffMember.role);
      setIsAvailable(staffMember.isAvailable);
    }
  }, [staffMember]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staffMember) return;

    const updatedStaffMember: StaffMember = {
      ...staffMember,
      name,
      email,
      phone,
      role,
      isAvailable,
    };
    onStaffUpdated(updatedStaffMember);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update the details for "{staffMember?.name}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
          {/* Name Input */}
          <div>
            <label htmlFor="edit-staff-name">Full Name</label>
            <Input id="edit-staff-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* Role Select Dropdown */}
          <div>
            <label htmlFor="edit-staff-role">Role</label>
            <Select value={role} onValueChange={(value: StaffRole) => setRole(value)}>
              <SelectTrigger id="edit-staff-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="edit-staff-email">Email Address</label>
            <Input id="edit-staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="edit-staff-phone">Phone Number</label>
            <Input id="edit-staff-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {/* Availability Select Dropdown */}
          <div className="col-span-full">
            <label htmlFor="edit-staff-availability">Availability</label>
            <Select
              value={isAvailable ? 'available' : 'busy'}
              onValueChange={(value) => setIsAvailable(value === 'available')}
            >
              <SelectTrigger id="edit-staff-availability">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full mt-4 col-span-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditStaffDialog;