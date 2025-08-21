// In src/renderer/src/components/ViewClientDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Client, Purchase, Repair } from '../types'; // Import Repair
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// --- 4A. IMPORT NEW COMPONENTS ---
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

interface ViewClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}
interface ExportOptions {
  clientId: number;
  clientName: string;
  type: 'purchases' | 'repairs';
  purchaseIds?: number[];
  repairIds?: number[];
}
// --- THIS IS THE FIX ---
// The full implementation of the function is restored here.
const getInitials = (name: string = ''): string => {
  // Split the name into parts.
  const names = name.split(' ');
  // If there are multiple parts, take the first letter of the first and last parts.
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  // Otherwise, just take the first letter of the single name.
  return name[0] ? name[0].toUpperCase() : '';
};

function ViewClientDialog({ client, isOpen, onClose }: ViewClientDialogProps): JSX.Element {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [selectedPurchases, setSelectedPurchases] = useState<number[]>([]); // ← Added
  const [selectedRepairs, setSelectedRepairs] = useState<number[]>([]); // ← Added
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && client) {
      setIsLoading(true);

      Promise.all([
        window.db.getPurchasesForClient(client.id),
        window.db.getRepairsForClient(client.id)
      ])
      .then(([fetchedPurchases, fetchedRepairs]) => {
        setPurchases(fetchedPurchases);
        setRepairs(fetchedRepairs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
    }
  }, [isOpen, client]);

// --- 4C. ADD HANDLERS FOR CHECKBOXES ---
  const handlePurchaseSelect = (id: number, checked: boolean) => {
    setSelectedPurchases(prev => checked ? [...prev, id] : prev.filter(pId => pId !== id));
  };
  const handleRepairSelect = (id: number, checked: boolean) => {
    setSelectedRepairs(prev => checked ? [...prev, id] : prev.filter(rId => rId !== id));
  };

  // --- 4D. ADD THE EXPORT HANDLER FUNCTION ---
  const handleExport = async (type: 'selected' | 'all', exportType: 'purchases' | 'repairs') => {
    if (!client) return;

    const options: ExportOptions = {
      clientId: client.id,
      clientName: client.name,
      type: exportType,
    };

    if (type === 'selected') {
      if (exportType === 'purchases') options.purchaseIds = selectedPurchases;
      if (exportType === 'repairs') options.repairIds = selectedRepairs;
    } else { // 'all'
      if (exportType === 'purchases') options.purchaseIds = purchases.map(p => p.id);
      if (exportType === 'repairs') options.repairIds = repairs.map(r => r.id);
    }
    
    if ((options.purchaseIds?.length || 0) === 0 && (options.repairIds?.length || 0) === 0) {
      toast.warning("Please select items to export.");
      return;
    }

    toast.info("Generating report...");
    try {
      const result = await window.db.generateClientReport(options);
      if (result.success) {
        toast.success("Report generated and saved successfully!");
      } else if (result.message !== 'Export cancelled by user.') {
        toast.error(`Failed to generate report: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  if (!client) return <></>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white dark:bg-slate-900">
        <DialogHeader> {/* ... existing header code ... */} </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* ... Contact Info ... */}

          {/* --- 4E. UPDATE PURCHASE AND REPAIR HISTORY SECTIONS --- */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Purchase History</h3>
              {/* --- EXPORT BUTTON DROPDOWN --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('selected', 'purchases')} disabled={selectedPurchases.length === 0}>Export Selected</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('all', 'purchases')} disabled={purchases.length === 0}>Export All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
              {isLoading ? <p>...</p> : purchases.length > 0 ? (
                purchases.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id={`pur-${p.id}`} onCheckedChange={(checked) => handlePurchaseSelect(p.id, !!checked)} />
                      <span><strong>{new Date(p.purchase_date).toLocaleDateString()}:</strong> <em className="ml-2 text-muted-foreground">{p.products}</em></span>
                    </div>
                    <strong>${p.total_price.toFixed(2)}</strong>
                  </div>
                ))
              ) : <p>...</p>}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Repair History</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" /> Export</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('selected', 'repairs')} disabled={selectedRepairs.length === 0}>Export Selected</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('all', 'repairs')} disabled={repairs.length === 0}>Export All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
              {isLoading ? <p>...</p> : repairs.length > 0 ? (
                repairs.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id={`rep-${r.id}`} onCheckedChange={(checked) => handleRepairSelect(r.id, !!checked)} />
                      <span><strong>{new Date(r.requestDate).toLocaleDateString()}:</strong> <em className="ml-2">{r.description}</em></span>
                    </div>
                    <span className="font-semibold">{r.status}</span>
                  </div>
                ))
              ) : <p>...</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewClientDialog;