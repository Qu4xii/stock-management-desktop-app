// In src/renderer/src/components/ViewClientDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Client, Purchase, Repair } from '../types'; // Import Repair
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ViewClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
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

  // This check MUST come AFTER the hooks to comply with Rules of Hooks.
  if (!client) {
    return <></>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.picture} alt={client.name} />
              <AvatarFallback className="text-2xl">{getInitials(client.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{client.name}</DialogTitle>
              <DialogDescription>
                Client ID Card: {client.idCard}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Phone:</strong> {client.phone}</p>
              <p className="col-span-2"><strong>Address:</strong> {client.address}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Purchase History</h3>
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
              {isLoading ? (
                <p className="text-muted-foreground">Loading history...</p>
              ) : purchases.length > 0 ? (
                purchases.map(p => (
                  <div key={p.id} className="text-sm flex justify-between">
                    <span>
                      <strong>{new Date(p.purchase_date).toLocaleDateString()}:</strong> 
                      <em className="ml-2 text-muted-foreground">{p.products}</em>
                    </span>
                    <strong>${p.total_price.toFixed(2)}</strong>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No purchase history found for this client.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Repair History</h3>
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
              {isLoading ? (
                <p className="text-muted-foreground">Loading history...</p>
              ) : repairs.length > 0 ? (
                repairs.map(r => (
                  <div key={r.id} className="text-sm flex justify-between items-center">
                    <span>
                      <strong>{new Date(r.requestDate).toLocaleDateString()}:</strong>
                      <em className="ml-2 text-muted-foreground max-w-xs truncate">{r.description}</em>
                    </span>
                    <span className="font-semibold">{r.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No repair history found for this client.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewClientDialog;