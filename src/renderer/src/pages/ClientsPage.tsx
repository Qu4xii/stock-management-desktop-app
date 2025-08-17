// In src/renderer/src/pages/ClientsPage.tsx

import React, { useState, useEffect, useCallback } from 'react'; // <-- Add useEffect and useCallback
import { PlusCircle } from 'lucide-react';
import ClientsTable from '../components/ClientsTable';
import AddClientDialog from '../components/AddClientDialog';
import EditClientDialog from '../components/EditClientDialog';
import ViewClientDialog from '../components/ViewClientDialog';
import { Button } from '../components/ui/button';
import { Client } from '../types';
import CreatePurchaseDialog from '../components/CreatePurchaseDialog';
function ClientsPage(): JSX.Element {
  // The master list of clients, now loaded from the database.
  const [clients, setClients] = useState<Client[]>([]);
  // State to manage which client is being edited or viewed.
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [purchasingClient, setPurchasingClient] = useState<Client | null>(null);

  // --- NEW: FUNCTION TO LOAD DATA FROM BACKEND ---
  const fetchClients = useCallback(async () => {
    const clientsFromDb = await window.db.getClients();
    setClients(clientsFromDb);
  }, []);

  // --- NEW: useEffect TO LOAD DATA ON PAGE LOAD ---
  // This hook runs once when the component is first rendered.
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);


  // --- UPDATED HANDLER FUNCTIONS ---
  const handleAddClient = async (newClientData: Omit<Client, 'id' | 'picture'>) => {
    await window.db.addClient(newClientData);
    fetchClients(); // Refresh the list from the database
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    await window.db.updateClient(updatedClient);
    setEditingClient(null); // Close the dialog
    fetchClients(); // Refresh the list
  };

  const handleDeleteClient = async (clientId: number) => {
    await window.db.deleteClient(clientId);
    fetchClients(); // Refresh the list
  };

   const handlePurchaseCreated = () => {
    // We could show a success toast here later
    console.log('Purchase created!');
    // No need to fetch clients, but we might need to refresh other data later
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
        onView={setViewingClient}
        onEdit={setEditingClient}
        onDelete={handleDeleteClient}
        onNewPurchase={setPurchasingClient}
      />

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
       <CreatePurchaseDialog
        client={purchasingClient}
        isOpen={!!purchasingClient}
        onClose={() => setPurchasingClient(null)}
        onPurchaseCreated={handlePurchaseCreated}
      />
    </div>
    
  );
}

export default ClientsPage;