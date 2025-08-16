// In src/renderer/src/pages/ClientsPage.tsx

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ClientsTable from '../components/ClientsTable';
import AddClientDialog from '../components/AddClientDialog';
import EditClientDialog from '../components/EditClientDialog'; // <-- IMPORT EDIT
import ViewClientDialog from '../components/ViewClientDialog'; // <-- IMPORT VIEW
import { Button } from '../components/ui/button';
import { Client } from '../components/types';

const initialClients: Client[] = [
  { id: 1, name: 'John Doe', idCard: 'AB123456', address: '123 Main St', email: 'john.doe@example.com', phone: '555-1234' },
  { id: 2, name: 'Jane Smith', idCard: 'CD789012', address: '456 Oak Ave', email: 'jane.smith@example.com', phone: '555-5678' },
];

function ClientsPage(): JSX.Element {
  const [clients, setClients] = useState<Client[]>(initialClients);
  // --- NEW STATE FOR THE DIALOGS ---
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // --- HANDLER FUNCTIONS ---
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'picture'>) => {
    const clientWithId: Client = { ...newClientData, id: Date.now() };
    setClients(prevClients => [...prevClients, clientWithId]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prevClients =>
      prevClients.map(c => (c.id === updatedClient.id ? updatedClient : c))
    );
    setEditingClient(null); // Close the dialog
  };

  const handleDeleteClient = (clientId: number) => {
    setClients(prevClients =>
      prevClients.filter(c => c.id !== clientId)
    );
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
      
      <ClientsTable 
        clients={clients}
        onView={setViewingClient} // Pass the state setter function directly
        onEdit={setEditingClient}
        onDelete={handleDeleteClient}
      />

      {/* Render the dialogs. They will only be visible when their state is not null. */}
      <EditClientDialog
        client={editingClient}
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onClientUpdated={handleUpdateClient}
      />
      <ViewClientDialog
        client={viewingClient}
        isOpen={!!viewingClient}
        onClose={() => setViewingClient(null)}
      />
    </div>
  );
}

export default ClientsPage;