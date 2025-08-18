// In src/renderer/src/components/EditRepairDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea'; // We'll use a Textarea for the description
import { Client, StaffMember, Repair, RepairStatus, RepairPriority } from '../types';

interface EditRepairDialogProps {
  repair: Repair | null;
  isOpen: boolean;
  onClose: () => void;
  onRepairUpdated: (updatedRepair: Repair) => void;
}

const statuses: RepairStatus[] = ['Not Started', 'In Progress', 'On Hold', 'Completed'];
const priorities: RepairPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

function EditRepairDialog({ repair, isOpen, onClose, onRepairUpdated }: EditRepairDialogProps): JSX.Element {
  // State for all the form fields
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RepairStatus>('Not Started');
  const [priority, setPriority] = useState<RepairPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [clientId, setClientId] = useState<number | undefined>(undefined);
  const [staffId, setStaffId] = useState<number | undefined>(undefined);

  // State to hold the lists of clients and staff for the dropdowns
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // This effect runs when the dialog opens to populate the form fields
  useEffect(() => {
    if (repair) {
      setDescription(repair.description);
      setStatus(repair.status);
      setPriority(repair.priority);
      setDueDate(new Date(repair.dueDate).toISOString().split('T')[0]); // Format for <input type="date">
      setTotalPrice(repair.totalPrice || 0);
      setClientId(repair.clientId);
      setStaffId(repair.staffId || undefined);
    }
  }, [repair]);

  // This effect runs once when the component mounts to fetch data for the dropdowns
  useEffect(() => {
    const fetchDataForDropdowns = async () => {
      const clientsData = await window.db.getClients();
      const staffData = await window.db.getStaff();
      setClients(clientsData);
      setStaff(staffData);
    };
    fetchDataForDropdowns();
  }, []);

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
      dueDate: new Date(dueDate).toISOString(),
      totalPrice,
      clientId,
      staffId: staffId || null, // Ensure staffId is null if undefined
    };
    onRepairUpdated(updatedRepair);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Edit Work Order</DialogTitle>
          <DialogDescription>
            Update the details for work order #{repair?.id}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
          
          <div className="md:col-span-2">
            <label>Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          
          <div>
            <label>Status</label>
            <Select value={status} onValueChange={(v: RepairStatus) => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <label>Priority</label>
            <Select value={priority} onValueChange={(v: RepairPriority) => setPriority(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <label>Assigned Client</label>
            <Select value={String(clientId)} onValueChange={(v) => setClientId(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <label>Assigned Technician</label>
            <Select value={String(staffId)} onValueChange={(v) => setStaffId(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Unassigned</SelectItem>
                {staff.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label>Due Date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          
          <div>
            <label>Bill / Total Price ($)</label>
            <Input type="number" value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} />
          </div>

          <Button type="submit" className="w-full mt-4 col-span-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditRepairDialog;