// In src/renderer/src/components/EditClientDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Client } from '../types';

interface EditClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: (updatedClient: Client) => void;
}

function EditClientDialog({ client, isOpen, onClose, onClientUpdated }: EditClientDialogProps): JSX.Element {
  const [name, setName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setIdCard(client.idCard);
      setAddress(client.address);
      setEmail(client.email);
      setPhone(client.phone);
    }
  }, [client]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return;

    const updatedClient: Client = {
      ...client,
      name,
      idCard,
      address,
      email,
      phone,
    };
    onClientUpdated(updatedClient);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update the details for "{client?.name}".
          </DialogDescription>
        </DialogHeader>
        {/* Using the same grid form from AddClientForm for consistency */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
          <div>
            <label htmlFor="edit-client-name" className="block text-sm font-medium dark:text-slate-300">Full Name</label>
            <input id="edit-client-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div>
            <label htmlFor="edit-client-idCard" className="block text-sm font-medium dark:text-slate-300">ID Card Number</label>
            <input id="edit-client-idCard" type="text" value={idCard} onChange={(e) => setIdCard(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div>
            <label htmlFor="edit-client-email" className="block text-sm font-medium dark:text-slate-300">Email Address</label>
            <input id="edit-client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div>
            <label htmlFor="edit-client-phone" className="block text-sm font-medium dark:text-slate-300">Phone Number</label>
            <input id="edit-client-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div className="col-span-full">
            <label htmlFor="edit-client-address" className="block text-sm font-medium dark:text-slate-300">Address</label>
            <input id="edit-client-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <button type="submit" className="w-full py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 col-span-full">
            Save Changes
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditClientDialog;