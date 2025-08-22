// File: src/renderer/src/components/EditStaffDialog.tsx

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
// [THEME] Import the Label component
import { Label } from './ui/label'
import { StaffMember, StaffRole } from '../types'
// [PERMISSIONS] We need this to prevent privilege escalation
import { usePermissions } from '../hooks/usePermissions'


interface EditStaffDialogProps {
  staffMember: StaffMember | null
  isOpen: boolean
  onClose: () => void
  onStaffUpdated: (updatedStaffMember: StaffMember) => void
}

const roles: StaffRole[] = ['Technician', 'Inventory Associate', 'Cashier', 'Manager', 'Not Assigned']

function EditStaffDialog({ staffMember, isOpen, onClose, onStaffUpdated }: EditStaffDialogProps): JSX.Element {
  const { currentUser } = usePermissions()

  // ... (state management remains the same)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<StaffRole>('Technician')
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    if (staffMember) {
      setName(staffMember.name)
      setEmail(staffMember.email)
      setPhone(staffMember.phone)
      setRole(staffMember.role)
      setIsAvailable(staffMember.isAvailable)
    }
  }, [staffMember])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!staffMember) return

    const updatedStaffMember: StaffMember = {
      ...staffMember,
      name,
      email,
      phone,
      role,
      isAvailable
    }
    onStaffUpdated(updatedStaffMember)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* [THEME] Remove hardcoded background */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>Update the details for "{staffMember?.name}".</DialogDescription>
        </DialogHeader>
        {/* [THEME] Refactor form to use Label components */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-staff-name">Full Name</Label>
            <Input id="edit-staff-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-staff-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: StaffRole) => setRole(value)}
              // A user cannot change their own role
              disabled={staffMember?.id === currentUser?.id}
            >
              <SelectTrigger id="edit-staff-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem
                    key={r}
                    value={r}
                    // Prevent non-managers from promoting others to manager
                    disabled={r === 'Manager' && currentUser?.role !== 'Manager'}
                  >
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-staff-email">Email Address</Label>
            <Input id="edit-staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-staff-phone">Phone Number</Label>
            <Input id="edit-staff-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="edit-staff-availability">Availability</Label>
            <Select value={isAvailable ? 'available' : 'busy'} onValueChange={(value) => setIsAvailable(value === 'available')}>
              <SelectTrigger id="edit-staff-availability"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-4 col-span-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditStaffDialog