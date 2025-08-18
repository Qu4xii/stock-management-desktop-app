// In src/renderer/src/pages/ClientsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// --- COMPONENT IMPORTS ---
import ClientsTable from '../components/ClientsTable';
import AddClientDialog from '../components/AddClientDialog';
import EditClientDialog from '../components/EditClientDialog';
import ViewClientDialog from '../components/ViewClientDialog';
import CreatePurchaseDialog from '../components/CreatePurchaseDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// --- TYPE IMPORT ---
import { Client } from '../types';

function ClientsPage(): JSX.Element {
  // --- STATE MANAGEMENT ---
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [purchasingClient, setPurchasingClient] = useState<Client | null>(null);

  // --- DATA FETCHING ---
  const fetchClients = useCallback(async () => {
    try {
      const clientsFromDb = await window.db.getClients();
      setClients(clientsFromDb);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load client data from the database.");
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // --- EVENT HANDLERS ---
  const handleAddClient = async (newClientData: Omit<Client, 'id' | 'picture'>) => {
    try {
      const newClient = await window.db.addClient(newClientData);
      toast.success(`Client "${newClient.name}" added successfully!`);
      fetchClients();
    } catch (error) {
      console.error('Failed to add client:', error);
      toast.error('Failed to add client. Please check the console for details.');
    }
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      await window.db.updateClient(updatedClient);
      toast.success(`Client "${updatedClient.name}" updated successfully!`);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Failed to update client:', error);
      toast.error('Failed to update client.');
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      await window.db.deleteClient(clientId);
      toast.success(`Client deleted successfully.`);
      fetchClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client.');
    }
  };

  const handlePurchaseCreated = () => {
    toast.success('New purchase recorded successfully!');
  };

  // --- FILTERING LOGIC ---
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.idCard && client.idCard.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- RENDER LOGIC ---
  return (
    // This is the root div for the page. It no longer has 'h-full'.
    <div className="flex flex-col gap-6">
      
      {/* Page Header Area */}
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

      {/* Search Input */}
      <div className="flex items-center">
        <Input 
          type="text"
          placeholder="Search by name, email, ID, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {/* The Table */}
      <ClientsTable 
        clients={filteredClients}
        onView={setViewingClient}
        onEdit={setEditingClient}
        onDelete={handleDeleteClient}
        onNewPurchase={setPurchasingClient}
      />

      {/* Dialogs */}
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
} // <-- This is the closing brace for the ClientsPage function.

export default ClientsPage;