// File: src/renderer/src/components/ViewClientDialog.tsx

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Client, Purchase, Repair } from '../types'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { FileDown } from 'lucide-react'
import { toast } from 'sonner'
// [PERMISSIONS] Step 1: Import the permissions hook
import { usePermissions } from '../hooks/usePermissions'

interface ViewClientDialogProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
}

interface ExportOptions {
  clientId: number
  clientName: string
  type: 'purchases' | 'repairs'
  purchaseIds?: number[]
  repairIds?: number[]
}

const getInitials = (name: string = ''): string => {
  const names = name.split(' ')
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return name[0] ? name[0].toUpperCase() : ''
}

function ViewClientDialog({ client, isOpen, onClose }: ViewClientDialogProps): JSX.Element {
  // [PERMISSIONS] Step 2: Get the 'can' function
  const { can } = usePermissions()

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [selectedPurchases, setSelectedPurchases] = useState<number[]>([])
  const [selectedRepairs, setSelectedRepairs] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && client) {
      setIsLoading(true)
      setSelectedPurchases([]) // Reset selections when dialog opens
      setSelectedRepairs([])   // Reset selections when dialog opens

      Promise.all([
        window.db.getPurchasesForClient(client.id),
        window.db.getRepairsForClient(client.id)
      ])
        .then(([fetchedPurchases, fetchedRepairs]) => {
          setPurchases(fetchedPurchases)
          setRepairs(fetchedRepairs)
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, client])

  const handlePurchaseSelect = (id: number, checked: boolean) => {
    setSelectedPurchases((prev) => (checked ? [...prev, id] : prev.filter((pId) => pId !== id)))
  }
  const handleRepairSelect = (id: number, checked: boolean) => {
    setSelectedRepairs((prev) => (checked ? [...prev, id] : prev.filter((rId) => rId !== id)))
  }

  const handleExport = async (type: 'selected' | 'all', exportType: 'purchases' | 'repairs') => {
    if (!client) return

    const options: ExportOptions = {
      clientId: client.id,
      clientName: client.name,
      type: exportType
    }

    if (type === 'selected') {
      if (exportType === 'purchases') options.purchaseIds = selectedPurchases
      if (exportType === 'repairs') options.repairIds = selectedRepairs
    } else {
      if (exportType === 'purchases') options.purchaseIds = purchases.map((p) => p.id)
      if (exportType === 'repairs') options.repairIds = repairs.map((r) => r.id)
    }

    if ((options.purchaseIds?.length || 0) === 0 && (options.repairIds?.length || 0) === 0) {
      toast.warning('Please select items to export.')
      return
    }

    toast.info('Generating report...')
    try {
      const result = await window.db.generateClientReport(options)
      if (result.success) {
        toast.success('Report generated and saved successfully!')
      } else if (result.message !== 'Export cancelled by user.') {
        toast.error(`Failed to generate report: ${result.message}`)
      }
    } catch (error: any) {
      toast.error(`An error occurred: ${error.message}`)
    }
  }

  if (!client) return <></>

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-card">
        {/* Header remains the same */}
        <DialogHeader>
            {/* ... your existing header code ... */}
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Contact info remains the same */}
          {/* ... */}
          
          {/* Purchase History Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Purchase History</h3>
              {/* [PERMISSIONS] Step 3: Conditionally render the Export button */}
              {can('clients:export-history') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileDown className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleExport('selected', 'purchases')}
                      disabled={selectedPurchases.length === 0}
                    >
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('all', 'purchases')}
                      disabled={purchases.length === 0}
                    >
                      Export All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {/* Purchase list rendering remains the same */}
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
                {/* ... your existing purchase list rendering logic ... */}
            </div>
          </div>

          {/* Repair History Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Repair History</h3>
              {/* [PERMISSIONS] Step 3 (Repeated): Conditionally render the Export button */}
              {can('clients:export-history') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileDown className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleExport('selected', 'repairs')}
                      disabled={selectedRepairs.length === 0}
                    >
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('all', 'repairs')}
                      disabled={repairs.length === 0}
                    >
                      Export All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {/* Repair list rendering remains the same */}
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
                {/* ... your existing repair list rendering logic ... */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewClientDialog