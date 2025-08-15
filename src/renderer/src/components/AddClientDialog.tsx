// In src/renderer/src/components/AddClientDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'; // Import the new Dialog components from ShadCN
import AddClientForm from './AddClientForm'; // Our existing form
import { Client } from './types';

// Define the props for this component
interface AddClientDialogProps {
  children: React.ReactNode; // This will be the "+" button that triggers the dialog
  onClientAdded: (clientData: Omit<Client, 'id' | 'picture'>) => void;
}

function AddClientDialog({ children, onClientAdded }: AddClientDialogProps): JSX.Element {
  // We need a state to control whether the dialog is open or closed,
  // so we can close it programmatically after a successful form submission.
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClientAdded = (clientData: Omit<Client, 'id' | 'picture'>) => {
    // First, call the function from the parent page to add the client.
    onClientAdded(clientData);
    // Then, close the dialog.
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* The DialogTrigger wraps the button that opens the dialog. */}
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      {/* DialogContent contains the actual pop-up modal. */}
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new client to your records.
          </DialogDescription>
        </DialogHeader>
        
        {/* We render our existing AddClientForm inside the dialog.
            We pass our new handler function to it. */}
        <AddClientForm onClientAdded={handleClientAdded} />

      </DialogContent>
    </Dialog>
  );
}

export default AddClientDialog;