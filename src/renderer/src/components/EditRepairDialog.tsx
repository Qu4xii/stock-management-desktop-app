// File: src/renderer/src/components/EditRepairDialog.tsx

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label' // [THEME FIX] Ensure Label is imported
import { Client, StaffMember, Repair, RepairStatus, RepairPriority } from '../types'
import { usePermissions } from '../hooks/usePermissions'

// ... (interfaces and const arrays remain the same) ...

function EditRepairDialog({ repair, isOpen, onClose, onRepairUpdated }: EditRepairDialogProps): JSX.Element {
  const { currentUser } = usePermissions()
  // ... (All state management remains the same) ...
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<RepairStatus>('Not Started')
  const [priority, setPriority] = useState<RepairPriority>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [clientId, setClientId] = useState<number | undefined>(undefined)
  const [staffId, setStaffId] = useState<number | undefined>(undefined)
  const [clients, setClients] = useState<Client[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])

  // ... (Both useEffect hooks remain the same) ...
   useEffect(() => {
    if (repair) {
      setDescription(repair.description);
      setStatus(repair.status);
      setPriority(repair.priority);
      setDueDate(repair.dueDate ? new Date(repair.dueDate).toISOString().split('T')[0] : '');
      setTotalPrice(repair.totalPrice || 0);
      setClientId(repair.clientId);
      setStaffId(repair.staffId || undefined);
    }
  }, [repair]);

  useEffect(() => {
    const fetchDataForDropdowns = async () => {
      const clientsData = await window.db.getClients();
      const staffData = await window.db.getStaff();
      setClients(clientsData);
      setStaff(staffData);
    };
    fetchDataForDropdowns();
  }, []);

  // ... (handleSubmit remains the same) ...
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!repair || !clientId) {
      alert('A client must be selected.');
      return;
    }

    const updatedRepair: Repair = {
      ...repair,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : '',
      totalPrice,
      clientId,
      staffId: staffId || null,
    };
    onRepairUpdated(updatedRepair);
  };

  const isTechnicianEditingOwnRepair = currentUser?.role === 'Technician' && repair?.staffId === currentUser?.id

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* [THEME FIX] The className here is now correct by default */}
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Work Order</DialogTitle>
          <DialogDescription>Update the details for work order #{repair?.id}.</DialogDescription>
        </DialogHeader>
        {/* [THEME FIX] This form now uses the standard ShadCN layout with proper Labels */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="md:col-span-2 grid w-full items-center gap-1.5">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(v: RepairStatus) => setStatus(v)}>
              <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-priority">Priority</Label>
            <Select value={priority} onValueChange={(v: RepairPriority) => setPriority(v)}>
              <SelectTrigger id="edit-priority"><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-client">Assigned Client</Label>
            <Select value={clientId ? String(clientId) : ""} onValueChange={(v) => setClientId(Number(v))} disabled={isTechnicianEditingOwnRepair}>
              <SelectTrigger id="edit-client"><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-staff">Assigned Technician</Label>
            <Select value={staffId ? String(staffId) : "0"} onValueChange={(v) => setStaffId(Number(v) || undefined)} disabled={isTechnicianEditingOwnRepair}>
              <SelectTrigger id="edit-staff"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Unassigned</SelectItem>
                {staff.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-due-date">Due Date</Label>
            <Input id="edit-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-price">Bill / Total Price ($)</Label>
            <Input id="edit-price" type="number" value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} />
          </div>
          <Button type="submit" className="w-full mt-4 col-span-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
//...
interface EditRepairDialogProps {
  repair: Repair | null;
  isOpen: boolean;
  onClose: () => void;
  onRepairUpdated: (updatedRepair: Repair) => void;
}

const statuses: RepairStatus[] = ['Not Started', 'In Progress', 'On Hold', 'Completed'];
const priorities: RepairPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default EditRepairDialog