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

  // Data fetching logic (correct as is)
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

  // --- HANDLER FUNCTIONS ---

  // --- FIX #1: Corrected handleAddStaff ---
  const handleAddStaff = async (newStaffData: Omit<StaffMember, 'id' | 'picture'>) => {
    try {
      // We create a new object and convert the 'isAvailable' boolean to a number (1 or 0)
      // because that's what the SQLite database expects.
      const dataForBackend = {
        ...newStaffData,
        isAvailable: newStaffData.isAvailable ? 1 : 0,
      };
      
      const newMember = await window.db.addStaff(dataForBackend as any);
      toast.success(`Staff member "${newMember.name}" added successfully!`);
      fetchStaff(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to add staff member:', error);
      toast.error(error.message || 'Failed to add staff member.');
    }
  };

  // --- FIX #2: Corrected handleUpdateStaff ---
  const handleUpdateStaff = async (updatedStaffMember: StaffMember) => {
    try {
      // We must also perform the same boolean-to-number conversion for the update operation.
      const dataForBackend = {
        ...updatedStaffMember,
        isAvailable: updatedStaffMember.isAvailable ? 1 : 0,
      };

      await window.db.updateStaff(dataForBackend as any);

      toast.success(`Staff member "${updatedStaffMember.name}" updated successfully!`);
      setEditingStaffMember(null);
      fetchStaff(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to update staff member:', error);
      toast.error(error.message || 'Failed to update staff member.');
    }
  };

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
  
  // Filtering logic (correct as is)
  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Render logic (correct as is)
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

      <StaffTable 
        staff={filteredStaff} 
        onEdit={setEditingStaffMember} 
        onDelete={handleDeleteStaff} 
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