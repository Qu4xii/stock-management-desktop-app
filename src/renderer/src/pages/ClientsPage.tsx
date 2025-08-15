// In src/renderer/src/pages/ClientsPage.tsx

import React, { useState } from 'react';
import ClientList from '../components/ClientList';
import AddClientDialog from '../components/AddClientDialog'; // <-- Import the new dialog
import { Button } from '../components/ui/button'; // <-- ShadCN's Button component
import { PlusCircle } from 'lucide-react'; // <-- Icon for the button
import { Client } from '../components/types';

// The initialClients data remains the same
const initialClients: Client[] = [
  { id: 1, name: 'John Doe', idCard: 'AB123456', address: '123 Main St', email: 'john.doe@example.com', phone: '555-1234' },
  { id: 2, name: 'Jane Smith', idCard: 'CD789012', address: '456 Oak Ave', email: 'jane.smith@example.com', phone: '555-5678' },
];

function ClientsPage(): JSX.Element {
  const [clients, setClients] = useState<Client[]>(initialClients);

  // The handleAddClient function remains exactly the same as before
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'picture'>) => {
    const clientWithId: Client = { ...newClientData, id: Date.now() };
    setClients(prevClients => [...prevClients, clientWithId]);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* --- PAGE HEADER --- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Client Management</h1>
          <p className="mt-1 text-muted-foreground">Add, view, and manage your clients.</p>
        </div>
        {/* --- THE NEW "+" BUTTON WRAPPED IN THE DIALOG --- */}
        <AddClientDialog onClientAdded={handleAddClient}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </AddClientDialog>
      </div>
      
      {/* The ClientList is now the main content of the page */}
      <ClientList clients={clients} />
    </div>
  );
}

export default ClientsPage;