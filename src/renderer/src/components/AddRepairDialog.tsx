// In src/renderer/src/components/AddRepairDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Client, StaffMember, Repair, RepairStatus, RepairPriority } from '../types';

interface AddRepairDialogProps {
  children: React.ReactNode; // The "+ New Work Order" button
  onRepairAdded: (repairData: Omit<Repair, 'id' | 'clientName' | 'staffName' | 'clientLocation'>) => void;
}

const statuses: RepairStatus[] = ['Not Started', 'In Progress', 'On Hold', 'Completed'];
const priorities: RepairPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

function AddRepairDialog({ children, onRepairAdded }: AddRepairDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  
  // State for all the form fields, initialized to default values
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

  // This effect runs once when the component mounts to fetch data for the dropdowns
  useEffect(() => {
    const fetchDataForDropdowns = async () => {
      try {
        const clientsData = await window.db.getClients();
        const staffData = await window.db.getStaff();
        setClients(clientsData);
        setStaff(staffData);
      } catch (error) {
        console.error("Failed to fetch data for dialog dropdowns:", error);
      }
    };
    fetchDataForDropdowns();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientId) {
      alert('You must select a client.');
      return;
    }

    onRepairAdded({
      description,
      status,
      priority,
      requestDate: new Date().toISOString(), // Set request date to now
      dueDate: new Date(dueDate).toISOString(),
      totalPrice,
      clientId,
      staffId: staffId || null,
    });

    // Close the dialog and reset the form
    setIsOpen(false);
    setDescription('');
    setStatus('Not Started');
    setPriority('Medium');
    setDueDate('');
    setTotalPrice(0);
    setClientId(undefined);
    setStaffId(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Create New Work Order</DialogTitle>
          <DialogDescription>
            Fill in the details for the new repair job.
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
            <label>Assign to Client</label>
            <Select value={clientId ? String(clientId) : ""} onValueChange={(v) => setClientId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Select a client..." /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <label>Assign to Technician</label>
            <Select value={staffId ? String(staffId) : ""} onValueChange={(v) => setStaffId(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Select a technician..." /></SelectTrigger>
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

          <Button type="submit" className="w-full mt-4 col-span-full">Create Work Order</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddRepairDialog;