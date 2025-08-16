// In src/renderer/src/components/ViewClientDialog.tsx

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Client } from '../types';
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
  if (!client) return null; // If no client is selected, render nothing

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
          {/* Contact Info Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Phone:</strong> {client.phone}</p>
              <p className="col-span-2"><strong>Address:</strong> {client.address}</p>
            </div>
          </div>

          {/* Purchase History Section (Placeholder) */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Purchase History</h3>
            <div className="border rounded-lg p-4 h-32 flex items-center justify-center">
              <p className="text-muted-foreground">Purchase history will be displayed here.</p>
            </div>
          </div>

          {/* Repair History Section (Placeholder) */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Repair History</h3>
            <div className="border rounded-lg p-4 h-32 flex items-center justify-center">
              <p className="text-muted-foreground">Repair history will be displayed here.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewClientDialog;