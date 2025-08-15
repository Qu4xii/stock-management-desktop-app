// In src/renderer/src/components/AddProductDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Product } from './types';

interface AddProductDialogProps {
  children: React.ReactNode;
  onProductAdded: (productData: Omit<Product, 'id'>) => void;
}

function AddProductDialog({ children, onProductAdded }: AddProductDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || price <= 0) {
      alert('Please provide a product name and a valid price.');
      return;
    }
    onProductAdded({ name, quantity: Number(quantity), price: Number(price) });
    setIsOpen(false); // Close the dialog
    // Reset form
    setName('');
    setQuantity(0);
    setPrice(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="price" className="text-right">Price ($)</label>
            <input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="col-span-3 mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quantity" className="text-right">Quantity</label>
            <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="col-span-3 mt-1 block w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddProductDialog;