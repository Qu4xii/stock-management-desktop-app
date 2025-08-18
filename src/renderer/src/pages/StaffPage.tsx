// In src/renderer/src/pages/StaffPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import StaffTable from '../components/StaffTable';
import EditStaffDialog from '../components/EditStaffDialog';
import AddStaffDialog from '../components/AddStaffDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { StaffMember } from '../types';

function StaffPage(): JSX.Element {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data fetching logic
  const fetchStaff = useCallback(async () => {
    try {
      const staffFromDb = await window.db.getStaff();
      setStaff(staffFromDb);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Failed to load staff data from the database.");
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Handler for adding a new staff member
  const handleAddStaff = async (newStaffData: Omit<StaffMember, 'id' | 'picture'>) => {
    try {
      const dataForBackend = { ...newStaffData, isAvailable: newStaffData.isAvailable ? 1 : 0 };
      const newMember = await window.db.addStaff(dataForBackend as any);
      toast.success(`Staff member "${newMember.name}" added successfully!`);
      fetchStaff();
    } catch (error: any) {
      console.error('Failed to add staff member:', error);
      toast.error(error.message || 'Failed to add staff member.');
    }
  };

  // Handler for updating a staff member (used by BOTH inline edits and the full dialog)
  const handleUpdateStaff = async (updatedStaffMember: StaffMember) => {
    try {
      const dataForBackend = { ...updatedStaffMember, isAvailable: updatedStaffMember.isAvailable ? 1 : 0 };
      await window.db.updateStaff(dataForBackend as any);
      toast.success(`Staff member "${updatedStaffMember.name}" updated successfully!`);
      setEditingStaffMember(null); // This will close the full dialog if it was open
      fetchStaff();
    } catch (error: any) {
      console.error('Failed to update staff member:', error);
      toast.error(error.message || 'Failed to update staff member.');
    }
  };

  // Handler for deleting a staff member
  const handleDeleteStaff = async (staffMemberId: number) => {
    try {
      await window.db.deleteStaff(staffMemberId);
      toast.success('Staff member deleted successfully.');
      fetchStaff();
    } catch (error) {
      console.error('Failed to delete staff member:', error);
      toast.error('Failed to delete staff member.');
    }
  };
  
  // Filtering logic
  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Technicians / Staff</h1>
        <div className="flex items-center gap-2">
          <Input 
            type="text"
            placeholder="Search staff..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddStaffDialog onStaffAdded={handleAddStaff}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Technician
            </Button>
          </AddStaffDialog>
        </div>
      </div>

      {/* 
        --- THIS IS THE FIX ---
        We now pass the 'onUpdate' prop to the StaffTable,
        satisfying the component's updated requirements.
      */}
      <StaffTable 
        staff={filteredStaff} 
        onEdit={setEditingStaffMember} 
        onDelete={handleDeleteStaff} 
        onUpdate={handleUpdateStaff}
      />

      <EditStaffDialog
        staffMember={editingStaffMember}
        isOpen={!!editingStaffMember}
        onClose={() => setEditingStaffMember(null)}
        onStaffUpdated={handleUpdateStaff}
      />
    </div>
  );
}

export default StaffPage;