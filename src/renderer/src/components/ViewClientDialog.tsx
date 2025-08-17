// In src/renderer/src/components/ViewClientDialog.tsx

// --- 1. IMPORT THE NECESSARY REACT HOOKS AND TYPES ---
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Client, Purchase } from '../types'; // Import both Client and Purchase types
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
  // --- 2. CREATE STATE TO STORE THE FETCHED PURCHASES ---
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 3. USE useEffect TO FETCH DATA WHEN THE DIALOG OPENS ---
  useEffect(() => {
    // This effect runs whenever 'isOpen' or 'client' changes.
    if (isOpen && client) {
      setIsLoading(true);
      // Call the backend API function we defined in the preload script.
      window.db.getPurchasesForClient(client.id)
        .then(fetchedPurchases => {
          setPurchases(fetchedPurchases);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, client]); // The dependency array ensures this runs at the right time.

  if (!client) return <></>; // Render nothing if no client is selected.

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
          {/* Contact Info Section (no changes here) */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Phone:</strong> {client.phone}</p>
              <p className="col-span-2"><strong>Address:</strong> {client.address}</p>
            </div>
          </div>

          {/* --- 4. UPDATE THE PURCHASE HISTORY SECTION TO DISPLAY REAL DATA --- */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Purchase History</h3>
            <div className="border rounded-lg p-4 min-h-[8rem] space-y-2">
              {isLoading ? (
                <p className="text-muted-foreground">Loading history...</p>
              ) : purchases.length > 0 ? (
                // If purchases are found, map over them and display the details.
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
                // If the array is empty after loading, show a message.
                <p className="text-muted-foreground">No purchase history found for this client.</p>
              )}
            </div>
          </div>

          {/* Repair History Section (still a placeholder) */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Repair History</h3>
            <div className="border rounded-lg p-4 min-h-[8rem] flex items-center justify-center">
              <p className="text-muted-foreground">Repair history will be displayed here.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewClientDialog;