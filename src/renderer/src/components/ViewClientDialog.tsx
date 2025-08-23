import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Client, Purchase, Repair } from '../types'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePermissions } from '../hooks/usePermissions'

interface ViewClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

const getInitials = (name: string = ''): string => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name[0] ? name[0].toUpperCase() : '';
};

function ViewClientDialog({ client, isOpen, onClose }: ViewClientDialogProps): JSX.Element {
  const { can, role } = usePermissions()

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [selectedPurchases, setSelectedPurchases] = useState<number[]>([])
  const [selectedRepairs, setSelectedRepairs] = useState<number[]>([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true)
  const [isLoadingRepairs, setIsLoadingRepairs] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const loadClientHistory = async () => {
      if (isOpen && client) {
        setIsLoadingPurchases(true)
        setIsLoadingRepairs(true)
        setPurchases([])
        setRepairs([])
        setSelectedPurchases([])
        setSelectedRepairs([])

        try {
          const fetchedPurchases = await window.db.getPurchasesForClient(client.id)
          setPurchases(fetchedPurchases)
        } catch (error) {
          console.error('FAILED TO FETCH PURCHASES:', error)
          toast.error('Could not load purchase history.')
        } finally {
          setIsLoadingPurchases(false)
        }

        try {
          let fetchedRepairs: Repair[]
          if (role === 'Technician') {
            fetchedRepairs = await window.db.getRepairsForClientByStaff(client.id)
          } else {
            fetchedRepairs = await window.db.getRepairsForClient(client.id)
          }
          setRepairs(fetchedRepairs)
        } catch (error) {
          console.error('FAILED TO FETCH REPAIRS:', error)
          toast.error('Could not load repair history.')
        } finally {
          setIsLoadingRepairs(false)
        }
      }
    }

    loadClientHistory()
  }, [isOpen, client, role])

  const handlePurchaseSelect = (id: number, checked: boolean) => {
    setSelectedPurchases(prev => checked ? [...prev, id] : prev.filter(pId => pId !== id));
  };
  
  const handleRepairSelect = (id: number, checked: boolean) => {
    setSelectedRepairs(prev => checked ? [...prev, id] : prev.filter(rId => rId !== id));
  };

  // WORKING EXPORT FUNCTIONALITY - NO MORE PLACEHOLDER!
  const handleExport = async (type: 'selected' | 'all', exportType: 'purchases' | 'repairs') => {
    if (!client) return;

    let purchaseIds: number[] = [];
    let repairIds: number[] = [];

    // Determine what to export based on type and exportType
    if (exportType === 'purchases') {
      if (type === 'all') {
        purchaseIds = purchases.map(p => p.id);
      } else {
        purchaseIds = selectedPurchases;
      }
    } else if (exportType === 'repairs') {
      if (type === 'all') {
        repairIds = repairs.map(r => r.id);
      } else {
        repairIds = selectedRepairs;
      }
    }

    // Check if there's anything to export
    if (purchaseIds.length === 0 && repairIds.length === 0) {
      toast.error(`No ${exportType} selected for export.`);
      return;
    }

    try {
      setIsExporting(true);
      toast.info(`Generating ${exportType} report...`);
      
      const result = await window.db.exportClientReport({
        clientId: client.id,
        clientName: client.name,
        purchaseIds,
        repairIds
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  if (!client) return <></>

  // Helper for rendering list content
  const renderListContent = (isLoading: boolean, items: any[], renderItem: (item: any) => JSX.Element, emptyMessage: string) => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
    }
    if (items.length === 0) {
      return <p className="text-center text-muted-foreground">{emptyMessage}</p>
    }
    return items.map(renderItem)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
         <DialogHeader>
           <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>Client Details: {client.name}</DialogTitle>
                <DialogDescription>Viewing full history and contact information.</DialogDescription>
              </div>
           </div>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {/* Purchase History */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Purchase History</h3>
              {can('clients:export-history') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isExporting}>
                      {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />} 
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('all', 'purchases')} disabled={isExporting}>Export All</DropdownMenuItem>
                    <DropdownMenuItem disabled={selectedPurchases.length === 0 || isExporting} onClick={() => handleExport('selected', 'purchases')}>Export Selected</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
              {renderListContent(isLoadingPurchases, purchases, p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id={`pur-${p.id}`} onCheckedChange={(checked) => handlePurchaseSelect(p.id, !!checked)} />
                    <span><strong>{new Date(p.purchase_date).toLocaleDateString()}:</strong> <em className="ml-2 text-muted-foreground">{p.products}</em></span>
                  </div>
                  <strong>${p.total_price.toFixed(2)}</strong>
                </div>
              ), "No purchases found for this client.")}
            </div>
          </div>

          {/* Repair History */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Repair History</h3>
              {can('clients:export-history') && (
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isExporting}>
                      {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />} 
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('all', 'repairs')} disabled={isExporting}>Export All</DropdownMenuItem>
                    <DropdownMenuItem disabled={selectedRepairs.length === 0 || isExporting} onClick={() => handleExport('selected', 'repairs')}>Export Selected</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
              {renderListContent(isLoadingRepairs, repairs, r => (
                 <div key={r.id} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Checkbox id={`rep-${r.id}`} onCheckedChange={(checked) => handleRepairSelect(r.id, !!checked)} />
                     <span><strong>{new Date(r.requestDate).toLocaleDateString()}:</strong> <em className="ml-2">{r.description}</em></span>
                   </div>
                   <span className="font-semibold">{r.status}</span>
                 </div>
              ), "No repairs found for this client.")}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewClientDialog