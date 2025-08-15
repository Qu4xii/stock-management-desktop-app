// In src/renderer/src/pages/ClientsPage.tsx
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ClientsTable from '../components/ClientsTable';
import AddClientDialog from '../components/AddClientDialog';
import { Button } from '../components/ui/button';
import { Client } from '../components/types';
import { Card } from '../components/ui/card';
const initialClients: Client[] = [
  { id: 1, name: 'John Doe', idCard: 'AB123456', address: '123 Main St, Anytown', email: 'john.doe@example.com', phone: '555-1234' },
  { id: 2, name: 'Jane Smith', idCard: 'CD789012', address: '456 Oak Ave, Sometown', email: 'jane.smith@example.com', phone: '555-5678' },
];

function ClientsPage(): JSX.Element {
  const [clients, setClients] = useState<Client[]>(initialClients);

  const handleAddClient = (newClientData: Omit<Client, 'id' | 'picture'>) => {
    const clientWithId: Client = { ...newClientData, id: Date.now() };
    setClients(prevClients => [...prevClients, clientWithId]);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="mt-1 text-muted-foreground">A list of all clients in your database.</p>
        </div>
        <AddClientDialog onClientAdded={handleAddClient}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </AddClientDialog>
      </div>
      <ClientsTable clients={clients} />
    </div>
  );
}

export default ClientsPage;