// In src/renderer/src/components/AddClientDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import AddClientForm from './AddClientForm';
import { Client } from '../types';

interface AddClientDialogProps {
  children: React.ReactNode;
  onClientAdded: (clientData: Omit<Client, 'id' | 'picture'>) => void;
}

function AddClientDialog({ children, onClientAdded }: AddClientDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClientAdded = (clientData: Omit<Client, 'id' | 'picture'>) => {
    onClientAdded(clientData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new client to your records.
          </DialogDescription>
        </DialogHeader>
        <AddClientForm onClientAdded={handleClientAdded} />
      </DialogContent>
    </Dialog>
  );
}

export default AddClientDialog;