// File: src/renderer/src/pages/RepairsPage.tsx

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
// [PERMISSIONS] Step 1: Import the permissions hook
import { usePermissions } from '../hooks/usePermissions'
import RepairsTable from '../components/RepairsTable'
import EditRepairDialog from '../components/EditRepairDialog'
import AddRepairDialog from '../components/AddRepairDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Repair } from '../types'
import { toast } from 'sonner'

function RepairsPage(): JSX.Element {
  // [PERMISSIONS] Step 2: Get the 'can' function
  const { can } = usePermissions()

  const [repairs, setRepairs] = useState<Repair[]>([])
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        // This single backend call now correctly returns either all repairs or
        // only assigned repairs based on the user's role.
        const repairsData = await window.db.getRepairs()
        setRepairs(repairsData)
      } catch (error) {
        console.error('Failed to fetch repairs:', error)
        toast.error('Failed to load work orders from the database.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRepairs()
  }, [])

  const handleAddRepair = async (
    newRepairData: Omit<Repair, 'id' | 'clientName' | 'staffName' | 'clientLocation'>
  ) => {
    try {
      const newRecord = await window.db.addRepair(newRepairData)
      setRepairs((prev) => [...prev, newRecord])
      toast.success('New work order has been created successfully!')
    } catch (error) {
      console.error('Failed to add repair:', error)
      toast.error('Error creating the new work order.')
    }
  }

  const handleUpdateRepair = async (updatedRepair: Repair) => {
    try {
      const updatedRecord = await window.db.updateRepair(updatedRepair)
      setRepairs((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)))
      setEditingRepair(null)
      toast.success('Work order has been updated successfully!')
    } catch (error: any) {
      console.error('Failed to update repair:', error)
      // Display the specific error from the backend (e.g., if a tech tries to edit another's repair)
      toast.error(error.message || 'Error updating the work order.')
    }
  }

  const handleDeleteRepair = async (repairId: number) => {
    try {
      await window.db.deleteRepair(repairId)
      setRepairs((prev) => prev.filter((r) => r.id !== repairId))
      toast.success('Work order has been deleted!')
    } catch (error) {
      console.error('Failed to delete repair:', error)
      toast.error('Error deleting the work order.')
    }
  }

  if (isLoading) {
    return <div className="text-center p-8">Loading work orders...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Repairs Order</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search work orders..." className="max-w-xs" />
          {/* [PERMISSIONS] Step 3: Conditionally render the New Work Order button */}
          {can('repairs:create') && (
            <AddRepairDialog onRepairAdded={handleAddRepair}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Work Order
              </Button>
            </AddRepairDialog>
          )}
        </div>
      </div>

      <RepairsTable repairs={repairs} onEdit={setEditingRepair} onDelete={handleDeleteRepair} />

      <EditRepairDialog
        repair={editingRepair}
        isOpen={!!editingRepair}
        onClose={() => setEditingRepair(null)}
        onRepairUpdated={handleUpdateRepair}
      />
    </div>
  )
}

export default RepairsPage