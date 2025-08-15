// In src/renderer/src/components/AddClientForm.tsx
import React, { useState } from 'react';
import { Client } from './types';

interface AddClientFormProps {
  onClientAdded: (clientData: Omit<Client, 'id' | 'picture'>) => void;
}

function AddClientForm({ onClientAdded }: AddClientFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !idCard || !email) {
      alert('Please fill out at least Name, ID Card, and Email.');
      return;
    }
    onClientAdded({ name, idCard, address, email, phone });
  };
  
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium dark:text-slate-300">Full Name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
      </div>
      <div>
        <label htmlFor="idCard" className="block text-sm font-medium dark:text-slate-300">ID Card Number</label>
        <input id="idCard" type="text" value={idCard} onChange={(e) => setIdCard(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium dark:text-slate-300">Email Address</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium dark:text-slate-300">Phone Number</label>
        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
      </div>
      <div className="col-span-full">
        <label htmlFor="address" className="block text-sm font-medium dark:text-slate-300">Address</label>
        <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
      </div>
      <button type="submit" className="w-full py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 col-span-full">
        Save Client
      </button>
    </form>
  );
}

export default AddClientForm;