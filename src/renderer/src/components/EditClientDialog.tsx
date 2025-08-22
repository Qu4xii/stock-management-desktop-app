// In src/renderer/src/components/EditClientDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Client } from '../types';
import { Input } from './ui/input'
import { Label } from './ui/label'
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
      {/* [THEME] The hardcoded background color has been removed */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>Update the details for "{client?.name}".</DialogDescription>
        </DialogHeader>
        {/* [THEME] The form has been refactored to use ShadCN components */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-client-name">Full Name</Label>
            <Input id="edit-client-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-client-idCard">ID Card Number</Label>
            <Input id="edit-client-idCard" type="text" value={idCard} onChange={(e) => setIdCard(e.target.value)} required />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-client-email">Email Address</Label>
            <Input id="edit-client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="edit-client-phone">Phone Number</Label>
            <Input id="edit-client-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="col-span-full grid w-full items-center gap-1.5">
            <Label htmlFor="edit-client-address">Address</Label>
            <Input id="edit-client-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <Button type="submit" className="w-full mt-4 col-span-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditClientDialog