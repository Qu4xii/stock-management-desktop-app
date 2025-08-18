// In src/renderer/src/pages/RepairsPage.tsx

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import RepairsTable from '../components/RepairsTable';
import EditRepairDialog from '../components/EditRepairDialog';
import AddRepairDialog from '../components/AddRepairDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Repair } from '../types';
import { toast } from 'sonner';

// --- 1. REMOVE SAMPLE DATA ---
// The state will now start empty and be populated from the database.
// const initialRepairs: Repair[] = [ ... ];

function RepairsPage(): JSX.Element {
  // --- 2. INITIALIZE STATE & ADD LOADING STATE ---
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 3. FETCH ALL DATA ON COMPONENT LOAD ---
  // This effect runs once when the page loads to get data from the database.
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const repairsData = await window.db.getRepairs();
        setRepairs(repairsData);
      } catch (error) {
        console.error("Failed to fetch repairs:", error);
        toast.error("Failed to load work orders from the database.");
      } finally {
        setIsLoading(false); // Stop loading indicator
      }
    };
    fetchRepairs();
  }, []); // The empty array [] ensures this runs only once.

  // --- 4. CONNECT HANDLER FUNCTIONS TO THE BACKEND ---

  const handleAddRepair = async (newRepairData: Omit<Repair, 'id' | 'clientName' | 'staffName' | 'clientLocation'>) => {
    try {
      // Call the backend to add the repair. It returns the complete new record.
      const newRecord = await window.db.addRepair(newRepairData);
      // Add the new record from the DB to our local state to update the UI.
      setRepairs(prev => [...prev, newRecord]);
      toast.success("New work order has been created successfully!");
    } catch (error) {
      console.error("Failed to add repair:", error);
      toast.error("Error creating the new work order.");
    }
  };

  const handleUpdateRepair = async (updatedRepair: Repair) => {
    try {
      // Call the backend to update the record.
      const updatedRecord = await window.db.updateRepair(updatedRepair);
      // Update the local state with the returned, updated record.
      setRepairs(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      setEditingRepair(null); // Close the dialog
      toast.success("Work order has been updated successfully!");
    } catch (error) {
      console.error("Failed to update repair:", error);
      toast.error("Error updating the work order.");
    }
  };

  const handleDeleteRepair = async (repairId: number) => {
    try {
      // Call the backend to delete the record.
      await window.db.deleteRepair(repairId);
      // Remove the record from local state to update the UI.
      setRepairs(prev => prev.filter(r => r.id !== repairId));
      toast.success("Work order has been deleted!");
    } catch (error) {
      console.error("Failed to delete repair:", error);
      toast.error("Error deleting the work order.");
    }
  };
  
  // --- 5. RENDER LOADING STATE ---
  if (isLoading) {
    return <div className="text-center p-8">Loading work orders...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Repairs Order</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search work orders..." className="max-w-xs" />
          <AddRepairDialog onRepairAdded={handleAddRepair}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          </AddRepairDialog>
        </div>
      </div>

      <RepairsTable 
        repairs={repairs}
        onEdit={setEditingRepair}
        onDelete={handleDeleteRepair}
      />

      <EditRepairDialog
        repair={editingRepair}
        isOpen={!!editingRepair}
        onClose={() => setEditingRepair(null)}
        onRepairUpdated={handleUpdateRepair}
      />
    </div>
  );
}

export default RepairsPage;